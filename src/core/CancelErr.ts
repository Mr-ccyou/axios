import { CancelErr } from '../types'

export class Cancel {
  message?: string

  constructor(message?: string) {
    this.message = message
  }
}

export function isCancelErr(cancelErr: CancelErr): boolean {
  return cancelErr instanceof Cancel
}
