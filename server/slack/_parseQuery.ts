export function parseQuery(q: string) {
  const result: { [key: string]: string } = {}
  return q.split('&').reduce((prev, s) => {
    const part = s.split('=')
    prev[part[0]] = decodeURIComponent(part[1])
    return prev
  }, result)
}
