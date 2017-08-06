import * as path from 'path'
import * as fs from 'fs'

const assets = {
  header: fs.readFileSync(path.join(__dirname, './views/_header.html'), 'utf-8'),
  footer: fs.readFileSync(path.join(__dirname, './views/_footer.html'), 'utf-8'),
}

export function serveHTML (html: string, vars: {[keys: string]: string}) {
  return assets.header + Object.keys(vars).reduce((prev, k) => {
    return prev.replace(new RegExp('{{{' + k + '}}}', 'g'), vars[k])
  }, html) + assets.footer
}
