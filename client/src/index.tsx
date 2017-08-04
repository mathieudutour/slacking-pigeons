import * as React from 'react'
import { render } from 'react-dom'
import { HookedChat } from './Chat'
import { Props as ChatOptions } from './NetworkHOC'

type Options = ChatOptions & {
  div?: Element
}

function renderHook(options: Options = {}) {
  if (!options.div) {
    options.div = document.createElement('div')
    document.body.insertBefore(options.div, document.body.firstChild)
  }

  return render(<HookedChat {...options} />, options.div)
}

declare var onSlackingPigeonsReady:
  | ((renderFunc: (options: Options) => void) => void)
  | undefined

if (typeof onSlackingPigeonsReady === 'undefined') {
  console.error(
    '[Slacking Pigeons] Missing `window.renderSlackingPigeons` function'
  )
} else {
  onSlackingPigeonsReady(renderHook)
}
