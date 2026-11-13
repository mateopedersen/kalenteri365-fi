const ACKNOWLEDGEMENT_KEY='fi-storage-notice-until';
const ACKNOWLEDGEMENT_DAYS=180;

export function initStorageNotice(){
  const notice=document.querySelector('#storage-notice');
  if(!notice)return;
  let acknowledged=false;
  let opener=null;
  try{acknowledged=Number(localStorage.getItem(ACKNOWLEDGEMENT_KEY))>Date.now();}catch{}
  notice.hidden=acknowledged;
  const close=()=>{
    notice.hidden=true;
    if(opener?.isConnected)opener.focus({preventScroll:true});
    opener=null;
  };
  document.querySelector('#storage-dismiss').addEventListener('click',()=>{
    try{localStorage.setItem(ACKNOWLEDGEMENT_KEY,String(Date.now()+ACKNOWLEDGEMENT_DAYS*86400000));}catch{}
    close();
  });
  notice.querySelector('[data-storage-close]').addEventListener('click',close);
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-storage-open]');
    if(!control)return;
    opener=control;
    notice.hidden=false;
    document.querySelector('#storage-dismiss').focus({preventScroll:true});
  });
}
