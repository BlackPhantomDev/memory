/**
 * Imprint dialog.
 *
 * Wires the footer "Imprint" button to a native `<dialog>` and its close
 * button, and closes the dialog on a backdrop click.
 *
 * @module imprint
 */

/**
 * Wires up the imprint dialog. Safe to call once on startup.
 */
export function initImprint(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#imprint-dialog');
  if (!dialog) return;

  document.querySelector('#imprint-btn')?.addEventListener('click', () => dialog.showModal());
  document.querySelector('#imprint-close')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
