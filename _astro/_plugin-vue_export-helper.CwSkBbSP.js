const s="https://www.nbtca.space",a=()=>{const t="id";return{getId:()=>new URLSearchParams(window.location.search).get(t),constructURL:r=>{const n=new URL("/graduation/download",s);return n.searchParams.append(t,r),n.toString()}}},e=(t,c)=>{const o=t.__vccOpts||t;for(const[r,n]of c)o[r]=n;return o};export{e as _,a as u};
