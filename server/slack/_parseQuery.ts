export function parseQuery (q: string) {
  const result: {[key: string]: string} = {}
  return q.split('&').reduce((prev, s) => {
    const part = s.split('=')
    prev[part[0]] = decodeURIComponent(part[1])
    return prev
  }, result)
}

export function parseUrlForQuery (url: string) {
  return parseQuery(url.split('?')[1])
}
