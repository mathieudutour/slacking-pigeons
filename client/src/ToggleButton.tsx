import * as React from 'react'
import styled from 'styled-components'
import {PigeonIcon} from './PigeonIcon'

const Wrapper = styled.div`
  z-index: 2147483000;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transition: box-shadow 80ms ease-in-out;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .06), 0 2px 32px rgba(0, 0, 0, .16);
  cursor: pointer;
  background: ${process.env.COLOR!};
`

const Cross = styled.div`
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAIVBMVEUAAAD///////////////////////////////////8AAADPn83rAAAACXRSTlMACq47u/I8r7wWzHxoAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAJJJREFUGNNdzzEKhDAQBdAvwtYWW9hbbSdCDrBnWBDS2Sx7A8HSKwgic1tNxj/jmirDC5P/UTSw01V4ri2nMr7xkg/HIAu+Qi6j9HhEcpB1gHFGGCuSTyQTlQ2Vg3ic4x49TVpzwcQXvI+3x/+r0p9eLAfyYhrIWNOSmfZkVlH2Kpm9Z+bJeh68oSYmnlGMnv1X7RZ2SET5id+LAAAAAElFTkSuQmCC);
  transform: rotate(${props => (props.open ? 0 : -30)}deg);
  transition: transform .16s linear, opacity .08s linear;
  background-position: 50%;
  background-size: 14px 14px;
  background-repeat: no-repeat;
  opacity: ${props => (props.open ? 1 : 0)};
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
`

const Pigeon = styled.div`
  transform: rotate(${props => (props.open ? 30 : 0)}deg)
    scale(${props => (props.open ? 0 : 1)});
  transition: transform .16s linear, opacity .08s linear;
  opacity: ${props => (props.open ? 0 : 1)};
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  padding: ${(60 - 40) / 2}px;
`

export class ToggleButton extends React.Component<
  { open: boolean; onClick: () => void; color?: string },
  {}
> {
  public render() {
    return (
      <Wrapper
        onClick={this.props.onClick}
        style={{ background: this.props.color }}
      >
        <Cross open={this.props.open} />
        <Pigeon open={this.props.open}>
          <PigeonIcon />
        </Pigeon>
      </Wrapper>
    )
  }
}
