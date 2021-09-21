// Creative Toolkit - by dave caruso
// Custom Electron Titlebar
import { Actions, useResource, winId } from '../frontend-state';
import c from './Titlebar.module.scss';
import pkg from '../../package.json';

import appicon from '../../assets/icon.png';
import DismissSVG from '../../assets/fluent-icons/dismiss.svg?component';
import SubtractSVG from '../../assets/fluent-icons/subtract.svg?component';
import MaximizeSVG from '../../assets/fluent-icons/maximize.svg?component';
import RestoreSVG from '../../assets/fluent-icons/restore.svg?component';
import PinSVG from '../../assets/fluent-icons/pin.svg?component';
import UnpinSVG from '../../assets/fluent-icons/unpin.svg?component';
import { useBind } from '../useBind';

export function Titlebar() {
  const win = useResource('window', winId);

  const close = useBind(Actions.window.close, winId);
  const minimize = useBind(Actions.window.minimize, winId);
  const maximize = useBind(Actions.window.maximize, winId);
  const pin = useBind(Actions.window.pin, winId);

  return (
    <div className={c.root}>
      <div className={c.appIcon}>
        <img src={appicon} alt='creative toolkit icon' />
      </div>
      <div className={c.title}>Creative Toolkit v{pkg.version}</div>
      <div className={c.button} onClick={pin}>
        {win.pinned ? <UnpinSVG /> : <PinSVG />}
      </div>
      <div className={c.button} onClick={minimize}>
        <SubtractSVG />
      </div>
      <div className={c.button} onClick={maximize}>
        {win.maximized ? <RestoreSVG /> : <MaximizeSVG />}
      </div>
      <div className={c.button} onClick={close}>
        <DismissSVG />
      </div>
    </div>
  );
}
