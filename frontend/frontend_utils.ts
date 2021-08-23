/** @deprecated remove this ASAP */
export async function $$stringDialog(id: string): Promise<string> {
  const root = document.createElement('div');
  root.id = 'dialog';
  root.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 99999;';
  const dialog = document.createElement('div');
  dialog.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 200px; background-color: white; border: 1px solid black;';
  const label = document.createElement('div');
  label.innerText = id;
  label.style = 'position: absolute; top: 10px; left: 10px;';
  const input = document.createElement('input');
  input.id = id;
  input.style = 'position: absolute; top: 50px; left: 10px; width: 500px; height: 30px;';
  input.autofocus = true;
  dialog.appendChild(label);
  dialog.appendChild(input);
  root.appendChild(dialog);
  document.body.appendChild(root);
  input.focus();
  return new Promise((resolve, reject) => {
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            resolve(input.value);
            root.remove();
          }
          if (e.key === 'Escape') {
            reject();
            root.remove();
          }
    });
  });
}

/** @deprecated remove this ASAP */
export async function $$numberDialog(id: string): Promise<number> {
  const x = await $$stringDialog(id);
  const y = parseInt(x, 10);
  if (isNaN(y)) {
    throw new Error('is nan '+ y);
  }
  return y;
}