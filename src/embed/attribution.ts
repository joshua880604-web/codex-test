// Best-effort integrity within this document. A cross-origin host can still crop or cover the iframe.
export function guardAttribution(credit: HTMLElement, href: string) {
  let repairing = false;
  const observer = new MutationObserver(records => {
    if (records.some(record => record.target === credit || credit.contains(record.target) ||
      Array.from(record.removedNodes).some(node => node === credit || node.contains(credit)))) restore();
  });
  function restore() {
    if (repairing) return;
    repairing = true; observer.disconnect();
    if (!document.body.contains(credit)) document.body.append(credit);
    credit.className = 'embed-credit'; credit.hidden = false;
    credit.removeAttribute('style');
    for (const [key,value] of Object.entries({display:'block',visibility:'visible',opacity:'1',position:'sticky',bottom:'0px','z-index':'3'})) credit.style.setProperty(key,value,'important');
    const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'nofollow noopener';
    link.textContent = '© CalculatorFree.io · Open full calculator';
    credit.replaceChildren(link);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden','href']});
    repairing = false;
  }
  restore();
  window.addEventListener('focus',restore);
  return () => { observer.disconnect(); window.removeEventListener('focus',restore); };
}
