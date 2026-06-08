import { spawn, execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const killPort = (port) => {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', timeout: 3000 })
    for (const line of out.split('\n')) {
      if (line.includes('LISTEN')) {
        const pid = line.trim().split(/\s+/).pop()
        if (pid && !isNaN(pid) && Number(pid) > 0) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
            console.log(`  ✓ Freed port ${port} (PID ${pid})`)
          } catch {}
        }
      }
    }
  } catch {}
}

console.log('🧹 Cleaning up stale processes...')
killPort(3001)

setTimeout(() => {
  console.log('🚀 Starting CinaHD...\n')

  const server = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    shell: false,
    cwd: __dirname,
  })

  const vite = spawn('node', ['node_modules/vite/bin/vite.js'], {
    stdio: 'inherit',
    shell: false,
    cwd: __dirname,
  })

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Server crashed (exit ${code}). Stopping Vite...`)
      vite.kill('SIGTERM')
      process.exit(1)
    }
  })

  vite.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Vite crashed (exit ${code}). Stopping server...`)
      server.kill('SIGTERM')
      process.exit(1)
    }
  })

  const cleanup = () => {
    console.log('\n🛑 Shutting down...')
    server.kill('SIGTERM')
    vite.kill('SIGTERM')
    setTimeout(() => process.exit(0), 1000)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}, 1500)
