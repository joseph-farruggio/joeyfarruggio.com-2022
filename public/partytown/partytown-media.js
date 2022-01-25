/* Partytown 0.2.1 - MIT builder.io */
(t=>{const e=Symbol(),s=Symbol(),n=Symbol(),r=Symbol(),i=Symbol(),o=Symbol(),a=[],u=(e,s)=>t[e]=c(e,s),c=(t,e)=>Object.defineProperty(e,"name",{value:t}),[h,d,f,p,m,g,l,v,S,y,L]=t.ptm;class b extends l{start(...t){return f(this,["start"],t)}end(...t){return f(this,["end"],t)}get length(){return h(this,["length"])}}u("TimeRanges",b);const w={buffered:{get(){return this[o]||(this[o]=new b(this[S],this[y],["buffered"]),setTimeout((()=>{this[o]=void 0}),5e3)),this[o]}},readyState:{get(){return 4===this[n]?4:("number"!=typeof this[n]&&(this[n]=h(this,["readyState"]),setTimeout((()=>{this[n]=void 0}),1e3)),this[n])}}};var E;m(t.HTMLMediaElement,w);class R extends Array{constructor(t){super(),this[s]=t}addEventListener(...t){f(this[s],["sourceBuffers","addEventListener"],t,3)}removeEventListener(...t){f(this[s],["sourceBuffers","removeEventListener"],t,3)}}class T extends v{constructor(t){super(t[S],t[y],["sourceBuffers"]),this[E]=[],this[s]=t}abort(){const t=x(this);f(this,[t,"appendWindowStart"],a,1)}addEventListener(...t){console.log("addEventListener");const e=x(this);f(this,[e,"addEventListener"],t,3)}appendBuffer(t){this[i].push(["appendBuffer",[t],t]),B(this)}get appendWindowStart(){const t=x(this);return h(this,[t,"appendWindowStart"])}set appendWindowStart(t){const e=x(this);d(this,[e,"appendWindowStart"],t)}get appendWindowEnd(){const t=x(this);return h(this,[t,"appendWindowEnd"])}set appendWindowEnd(t){const e=x(this);d(this,[e,"appendWindowEnd"],t)}get buffered(){const t=this[s],e=x(this);return new b(t[S],t[y],["sourceBuffers",e,"buffered"])}changeType(t){const e=x(this);f(this,[e,"changeType"],[t],2)}get mode(){const t=x(this);return h(this,[t,"mode"])}set mode(t){const e=x(this);d(this,[e,"mode"],t)}remove(t,e){this[i].push(["remove",[t,e]]),B(this)}removeEventListener(...t){const e=x(this);f(this,[e,"removeEventListener"],t,3)}get timestampOffset(){const t=x(this);return h(this,[t,"timestampOffset"])}set timestampOffset(t){const e=x(this);d(this,[e,"timestampOffset"],t)}get updating(){const t=x(this);return h(this,[t,"updating"])}}E=i;const B=t=>{if(t[i].length){if(!t.updating){const e=t[i].shift();if(e){const s=x(t);f(t,[s,e[0]],e[1],3,void 0,e[2])}}setTimeout((()=>B(t)),50)}},x=t=>t?t[s][r].indexOf(t):-1;u("SourceBufferList",R),u("SourceBuffer",T);const W=new Map;m(t.HTMLVideoElement,{currentTime:{get:()=>0},playbackRate:{get:()=>1}});const O=(t,e,s)=>{const n=t[S],r=g(),i={[S]:n,[y]:r,[L]:[]},o=f(t,["getContext"],[e,s],1,r),a={get:(t,e)=>"string"==typeof e&&e in o?"function"==typeof o[e]?(...t)=>{if(e.startsWith("create")){const r=g();return f(i,[e],t,2,r),"createImageData"===e||"createPattern"===e?(s=`${e}()`,console.warn(`${s} not implemented`),{setTransform:()=>{}}):new C(n,r)}var s;const r=k.includes(e)?1:2;return f(i,[e],t,r)}:o[e]:t[e],set:(t,e,s)=>("string"==typeof e&&e in o?(o[e]!==s&&"function"!=typeof s&&d(i,[e],s),o[e]=s):t[e]=s,!0)};return new Proxy(o,a)},C=class{constructor(t,e){this[S]=t,this[y]=e,this[L]=[]}addColorStop(...t){f(this,["addColorStop"],t,2)}};u("CanvasGradient",C),u("CanvasPattern",CanvasPattern);const k="getContextAttributes,getImageData,getLineDash,getTransform,isPointInPath,isPointInStroke,measureText".split(","),P=(t,e,s)=>{const n=t[S],r=g(),i={[S]:n,[y]:r,[L]:[]},o=f(t,["getContext"],[e,s],1,r),a={get:(t,e)=>"string"==typeof e?"function"!=typeof o[e]?o[e]:(...t)=>f(i,[e],t,M(e)):t[e],set:(t,e,s)=>("string"==typeof e&&e in o?(o[e]!==s&&"function"!=typeof s&&d(i,[e],s),o[e]=s):t[e]=s,!0)};return new Proxy(o,a)},U="checkFramebufferStatus,makeXRCompatible".split(","),M=t=>t.startsWith("create")||t.startsWith("get")||t.startsWith("is")||U.includes(t)?1:2,$={getContext:{value(t,s){return this[e]||(this[e]=(t.includes("webgl")?P:O)(this,t,s)),this[e]}}};m(t.HTMLCanvasElement,$);const j={Audio:t=>c("HTMLAudioElement",class{constructor(e){const s=t.j.createElement("audio");return s.src=e,s}}),MediaSource:(t,e,s)=>{const n=e.URL=c("URL",class extends URL{});return n.createObjectURL=t=>f(e,["URL","createObjectURL"],[t]),n.revokeObjectURL=t=>f(e,["URL","revokeObjectURL"],[t]),c(s,class extends v{constructor(){super(t.I,g()),this[r]=new R(this),p(this,s,a)}get activeSourceBuffers(){return[]}addSourceBuffer(t){const e=new T(this);return this[r].push(e),f(this,["addSourceBuffer"],[t]),e}clearLiveSeekableRange(){f(this,["clearLiveSeekableRange"],a,2)}get duration(){return h(this,["duration"])}set duration(t){d(this,["duration"],t)}endOfStream(t){f(this,["endOfStream"],[t],3)}get readyState(){return h(this,["readyState"])}removeSourceBuffer(t){const e=x(t);e>-1&&(this[r].splice(e,1),f(this,["removeSourceBuffer"],[e],1))}setLiveSeekableRange(t,e){f(this,["setLiveSeekableRange"],[t,e],2)}get sourceBuffers(){return this[r]}static isTypeSupported(t){if(!W.has(t)){const n=f(e,[s,"isTypeSupported"],[t]);W.set(t,n)}return W.get(t)}})}};t.ptm=j})(self);
