(this.webpackJsonpfront=this.webpackJsonpfront||[]).push([[0],{16:function(e,t,n){var r,a=n(36).wrap,c=n(29);e.exports=function e(){return this instanceof e?a(c()):r||(r=a(c()))}},26:function(e,t,n){},28:function(e,t,n){},29:function(e,t,n){e.exports=function(){return new Worker(n.p+"53a8fe5b63ac86ae25b4.worker.js")}},35:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(15),i=n.n(c),o=(n(26),n(3)),s=n(2),u=n(12),l=n(8),d=n.n(l),f=(n(28),n(16)),p=n.n(f),h=n(4),x=n(17);function b(e){return"function"===typeof e?e():e}function y(){for(var e=0;e<arguments.length-1;e++){var t=Object(s.a)(arguments[e],2),n=t[0],r=t[1];if(b(n))return b(r)}var a=arguments.length-1;if(!Array.isArray(arguments[a]))return b(arguments[a]);var c=Object(s.a)(arguments[a],2),i=c[0],o=c[1];return b(i)?b(o):void 0}var j=function(e,t,n){return function(e,t,n){return Math.max(t,Math.min(n,e))}((n-e)/(t-e),0,1)},m=function(e,t,n){return(r=j(e,t,n))<.5?2*r*r:(4-2*r)*r-1;var r};var v=n(18),O=(n(11),10),g={arrow:{name:"arrow",damage:1,cooldown:2,cost:4,maxDist:15},fire:{name:"fire",damage:2,cooldown:4,cost:5,maxDist:15}};function w(e,t){var n={x:t.x-e.x,y:t.y-e.y};return n.l=Math.sqrt(n.x*n.x+n.y*n.y),n}function E(e){var t=[],n=e.currentChar;[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach((function(e){var r,a,c=Object(s.a)(e,2),i=c[0],u=c[1],l={x:(a={x:i,y:u}).x+(r=n).x,y:a.y+r.y};t.push(Object(o.a)({type:"move"},l))})),e.chars.forEach((function(e){e.team!==n.team&&t.push({type:"attack",target:e.id})})),e.chars.forEach((function(e){e.team!==n.team&&t.push({type:"arrow",target:e.id})})),t.push({type:"pass"});var r=[];return t.forEach((function(t){var n=k(e,t),a=n.cost,c=n.possible,i=n.effects;c&&r.push(Object(o.a)(Object(o.a)({},t),{},{cost:a,effects:i}))})),r}var A={END_TURN:"END_TURN",REGEN_PA:"REGEN_PA",LOSE_PA:"LOSE_PA",LOSE_HP:"LOSE_HP",MOVE:"MOVE",EMPTY_POWER:"EMPTY_POWER",ANIM_MOVE:"ANIM_MOVE",ANIM_ATTACK:"ANIM_ATTACK",ANIM_ARROW:"ANIM_ARROW"};function k(e,t){var n,r,a=e.currentChar,c=e.currentChar.id,i=0,o=!1,s=[];if("move"===t.type){if(function(e){return 0===e}((n=t,(r=e.map).tiles[n.x+n.y*r.w]))){var u=w(a,t);if(u.l>0&&u.l<1.5)if((i=1===u.l?2:3)<=a.pa)(o=0===e.chars.filter((function(e){return e.x===t.x&&e.y===t.y})).length)&&(s.push({type:A.LOSE_PA,charId:c,cost:i}),s.push({type:A.ANIM_MOVE,charId:c,from:{x:a.x,y:a.y},to:{x:t.x,y:t.y}}),s.push({type:A.MOVE,charId:c,x:t.x,y:t.y}))}}else if("attack"===t.type){i=3;var l=e.chars.find((function(e){return e.id===t.target}));if(l.hp>0){var d=w(a,l);if(d.l>0&&d.l<1.5)i<=a.pa&&(o=!0,s.push({type:A.ANIM_ATTACK,charId:c,d:d}),s.push({type:A.LOSE_PA,charId:c,cost:i}),s.push({type:A.LOSE_HP,charId:t.target,hpLost:1}))}}else if("arrow"===t.type){var f=g[t.type];i=f.cost;var p=e.chars.find((function(e){return e.id===t.target}));if(!a.cooldown.arrow&&p.hp>0){var h=w(a,p);if(h.l>0&&h.l<=f.maxDist)i<=a.pa&&(o=!0,s.push({type:A.EMPTY_POWER,charId:c,power:f.name}),s.push({type:A.ANIM_ARROW,charId:c,from:{x:a.x,y:a.y},to:{x:p.x,y:p.y},d:h}),s.push({type:A.LOSE_PA,charId:c,cost:i}),s.push({type:A.LOSE_HP,charId:t.target,hpLost:1}))}}else"pass"===t.type&&(i=0,o=!0,s.push({type:A.END_TURN,charId:c}));return{cost:i,possible:o,effects:s}}function I(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(0!==t.length){var r=[];t.forEach((function(t){if(t.type===A.LOSE_HP)e.chars.find((function(e){return e.id===t.charId})).hp-=t.hpLost;else if(t.type===A.LOSE_PA)e.chars.find((function(e){return e.id===t.charId})).pa-=t.cost;else if(t.type===A.EMPTY_POWER)e.chars.find((function(e){return e.id===t.charId})).cooldown[t.power]=g[t.power].cooldown;else if(t.type===A.MOVE){var a=e.chars.find((function(e){return e.id===t.charId}));a.x=t.x,a.y=t.y}else if(t.type===A.REGEN_PA){var c=e.chars.find((function(e){return e.id===t.charId}));c.pa=Math.min(c.pa+10,15)}else if(t.type===A.END_TURN){var i=e.chars.find((function(e){return e.id===t.charId}));Object.keys(i.cooldown).forEach((function(e){1===i.cooldown[e]?delete i.cooldown[e]:i.cooldown[e]-=1})),i.lastPlayedTurn+=1,e.nextChars=C(e),e.currentChar=e.nextChars[0],r.push({type:A.REGEN_PA,charId:t.charId})}!0===n&&[A.ANIM_ATTACK,A.ANIM_MOVE,A.ANIM_ARROW].includes(t.type)&&(e.chars.find((function(e){return e.id===t.charId})).anim=Object(o.a)(Object(o.a)({},t),{},{startTime:performance.now()})),e.effects.push(Object(o.a)({computedAt:performance.now()},t))})),I(e,r)}}var M,C=function(e){var t=[],n=Number.MAX_SAFE_INTEGER,r=e.chars.filter((function(e){return e.hp>=1}));for(r.forEach((function(e){n=Math.min(n,e.lastPlayedTurn)})),r.filter((function(e){return e.lastPlayedTurn===n})).forEach((function(e){t.push(e)}));t.length<10;)r.forEach((function(e){t.push(e)}));return t.slice(0,10)},_=n(1),R=n(11),S=50,P=v.a.div(M||(M=Object(x.a)(["\n  width: 50px;\n  height: 50px;\n  transition: 200ms;\n  cursor: pointer;\n  &:hover {\n    opacity: 0.8;\n  }\n"])));function T(e){var t=e.state,n=e.user,a=e.do_action,c=Object(r.useState)(null),i=Object(s.a)(c,2),u=i[0],l=i[1],d=Object(r.useState)(null),f=Object(s.a)(d,2),p=f[0],x=f[1],b=Object(r.useMemo)((function(){return R.throttle(x,30)}),[]),j=Object(r.useMemo)((function(){var e=t.actions.map((function(e){return Object(o.a)({isAction:!0},e)})).concat(t.effects);return e.sort((function(e,t){return e.computedAt-t.computedAt})),e.splice(0,e.length-100),e}),[t]),m=t.nextChars,v=t.currentChar,O=v.user===n,g=Object(r.useCallback)((function(){O&&a({type:"pass",charId:m[0].id,user:n})}),[t,n,a]),w=Object(r.useState)(null),A=Object(s.a)(w,2),I=A[0],M=A[1],C=Object(r.useState)({possible:!1,cost:0,type:"none"}),T=Object(s.a)(C,2),N=T[0],L=T[1],z=Object(r.useRef)();Object(r.useEffect)((function(){var e=z.current;e.scrollTop=e.scrollHeight}),[t]),Object(r.useEffect)((function(){M(null)}),[t]);var F=Object(r.useMemo)((function(){return E(t).map((function(e){return delete e.effects,e}))}),[t]);Object(r.useEffect)((function(){O&&1===F.length&&g()}),[O,F,g]);var H=Object(r.useState)(0),V=Object(s.a)(H,2),G=V[0],Y=V[1],K=Object(r.useRef)({handle:null,tickAfter:!1});Object(r.useEffect)((function(){if(K.current.handle)K.current.tickAfter=!0;else{K.current.handle=setTimeout((function(){K.current.handle=null,K.current.tickAfter&&(Y((function(e){return e+1})),K.current.tickAfter=!1)}),100);var e="none",n=0,r=!1,a=null;null===I&&null!==p&&null===u?a=k(t,{type:e="move",x:p.x,y:p.y}):"attack"!==I&&null!==I||null===u||u===t.currentChar.id?"arrow"===I&&null!==u&&u!==t.currentChar.id&&(a=k(t,{type:e="arrow",target:u})):a=k(t,{type:e="attack",target:u}),a&&(n=a.cost,r=a.possible),L({type:e,possible:r,cost:n})}}),[t,I,u,p,G]);var B=Object(r.useCallback)((function(e,t){O&&!0===N.possible&&a({type:"move",x:e,y:t,charId:v.id,user:n})}),[t,n,a,v,N]),J=Object(r.useCallback)((function(e){O&&!0===N.possible&&a({type:N.type,target:e,charId:v.id})}),[t,n,a,v,N]),U=Object(r.useRef)();return Object(_.jsxs)("div",{style:{width:"100%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"},children:[Object(_.jsx)("div",{children:"webturn v:0.0.6"}),Object(_.jsx)("div",{style:{display:"flex",alignItems:"center",padding:"10px",boxSizing:"border-box"},children:m.map((function(e,t){return Object(_.jsxs)("div",{onMouseEnter:function(){return l(e.id)},onMouseLeave:function(){return l(null)},style:{background:u===e.id?"#ccc":"#fff",padding:"5px",margin:"5px",color:"black",userSelect:"none",border:0===t?"4px solid #aef":"2px solid #0000",borderRadius:"5px"},children:[Object(_.jsx)("div",{children:Object(_.jsx)("img",{style:{width:"30px"},src:e.avatar})}),e.name]},e.id+t)}))}),Object(_.jsxs)("div",{style:{position:"relative",cursor:y([!O,"not-allowed"],["attack"===N.type,"crosshair"],[!0===N.possible,"pointer"],"not-allowed")},children:[R.chunk(t.map.tiles,t.map.w).map((function(e,n){return Object(_.jsx)("div",{style:{display:"flex"},children:e.map((function(e,r){return Object(_.jsx)("div",{style:{width:"50px",height:"50px",transition:"50ms",background:y([1===e,"#333"],[0===e&&(null===p||void 0===p?void 0:p.index)===r+t.map.w*n,"#bbb"],"#999")}},r)}))},n)})),Object(_.jsx)("div",{onClick:function(){return B(p.x,p.y)},ref:U,onMouseMove:function(e){var n=U.current.getBoundingClientRect(),r=Math.floor((e.clientX-n.x)/S),a=Math.floor((e.clientY-n.y)/S),c=r+t.map.w*a;b({x:r,y:a,index:c})},style:{position:"absolute",top:"0px",left:"0px",width:"100%",height:"100%"}}),t.chars.map((function(e){return Object(_.jsx)(D,{charHover:u,onMouseEnter:function(){return l(e.id)},onMouseLeave:function(){return l(null)},onClick:function(){return J(e.id)},currentChar:v,char:e},"cahr"+e.id)}))]}),Object(_.jsxs)("div",{style:{opacity:O?"1":"0.7",cursor:O?"auto":"not-allowed"},children:[Object(_.jsx)("div",{style:{display:"flex",alignItems:"center",margin:"10px"},children:y(["none"===N.type,function(){return Object(_.jsx)("div",{children:"none"})}],["none"!==N.type,function(){return Object(_.jsxs)("div",{style:{color:N.possible?"black":"red"},children:[N.type," (cost ",N.cost,")"]})}])}),Object(_.jsx)("div",{style:{display:"flex",alignItems:"center",margin:"10px"},children:Object(h.a)(Array(15).keys()).map((function(e){return Object(_.jsx)("div",{style:{width:"30px",height:"30px",borderRadius:"50%",margin:"5px",border:"3px solid black",transition:"500ms",background:y([e+1<=v.pa-N.cost,"#bbb"],[e+1<=v.pa,"#5ee"],"#000")}},v.id+"/"+e)}))}),Object(_.jsxs)("div",{style:{margin:"10px",background:"#eee"},children:[Object(_.jsx)("div",{style:{fontSize:"1.2em",background:"#345",color:"white",padding:"5px"},children:"Power"}),Object(_.jsxs)("div",{style:{display:"flex"},children:[Object(_.jsx)(P,{onClick:function(){return M(null)},style:{display:"flex",alignItems:"center",justifyContent:"center",background:"#333",color:"white",border:"3px solid #000"},children:"Move"}),Object(_.jsx)(P,{onClick:g,style:{display:"flex",alignItems:"center",justifyContent:"center",background:"#333",color:"white",border:"3px solid #000"},children:"Pass"}),Object(_.jsx)(P,{onClick:function(){return M((function(e){return"attack"===e?null:"attack"}))},style:{display:"flex",alignItems:"center",justifyContent:"center",background:"attack"===I?"#999":"#333",color:"white",border:"3px solid #000"},children:"Attack"}),Object(_.jsxs)(P,{onClick:function(){v.cooldown.arrow||M((function(e){return"arrow"===e?null:"arrow"}))},style:{display:"flex",alignItems:"center",justifyContent:"center",background:y([v.cooldown.arrow,"#a00"],"arrow"===I?"#999":"#333"),color:"white",border:"3px solid #000"},children:["Arrow",v.cooldown.arrow&&" ("+v.cooldown.arrow+")"]})]})]}),Object(_.jsxs)("div",{style:{display:"flex",flexDirection:"row",margin:"10px"},children:[Object(_.jsxs)("div",{style:{marginRight:"20px",minWidth:"450px"},children:[Object(_.jsx)("div",{style:{fontSize:"1.2em",background:"#345",color:"white",padding:"5px"},children:"History"}),Object(_.jsx)("div",{ref:z,style:{background:"#eee",height:"200px",overflowY:"scroll",display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"flex-start"},children:j.map((function(e,n){return Object(_.jsx)("div",{style:{},children:Object(_.jsx)(W,{action:e,state:t})},n)}))})]}),Object(_.jsxs)("div",{style:{display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"flex-start",flex:"1 100 auto",background:"#eee",minWidth:"450px"},children:[Object(_.jsx)("div",{style:{fontSize:"1.2em",background:"#345",color:"white",padding:"5px",width:"100%",boxSizing:"border-box"},children:"Possible actions"}),F.map((function(e,t){return Object(_.jsx)("div",{children:JSON.stringify(e)},t)}))]})]})]})]})}function N(e){var t=e.name,n=e.avatar;return Object(_.jsxs)("div",{style:{fontWeight:"500",width:"100px",flex:"none",display:"flex",alignItems:"center",background:"#ccc",color:"black",height:"30px"},children:[Object(_.jsx)("img",{style:{width:"30px",marginRight:"5px"},src:n}),Object(_.jsx)("div",{children:t})]})}function L(e){var t=e.effect,n=e.state,a=Object(r.useMemo)((function(){return n.chars.find((function(e){return e.id===t.charId}))})),c=Object(r.useMemo)((function(){var e=R.cloneDeep(t);return delete e.computedAt,delete e.charId,delete e.type,e}),[t]);return Object(_.jsxs)("div",{style:{margin:"2px",display:"flex",alignItems:"center",justifyContent:"flex-start"},children:[Object(_.jsx)("div",{style:{marginRight:"40px"}}),Object(_.jsx)(N,{name:a.name,avatar:a.avatar}),Object(_.jsx)("div",{style:{fontWeight:"500",width:"150px",padding:"4px",height:"30px",boxSizing:"border-box",flex:"none",display:"flex",alignItems:"center",justifyContent:"flex-start",background:"#666",color:"white"},children:t.type}),Object(_.jsx)("div",{style:{fontSize:"0.8em",fontWeight:"bold",padding:"2px"},children:JSON.stringify(c)})]})}function W(e){var t=e.action,n=e.state;return t.isAction?Object(_.jsxs)("div",{style:{margin:"2px",display:"flex",alignItems:"center",justifyContent:"flex-start"},children:[Object(_.jsx)(N,{name:t.char.name,avatar:t.char.avatar}),Object(_.jsx)("div",{style:{fontWeight:"500",width:"150px",padding:"4px",height:"30px",boxSizing:"border-box",flex:"none",display:"flex",alignItems:"center",justifyContent:"flex-start",background:"#666",color:"white"},children:t.type}),y(["move"===t.type,function(){return Object(_.jsxs)("div",{style:{fontSize:"0.8em",fontWeight:"bold",padding:"2px"},children:["x:",t.x," / y:",t.y]})}],["attack"===t.type||"arrow"===t.type,function(){var e=n.chars.find((function(e){return e.id===t.target}));return Object(_.jsxs)(_.Fragment,{children:[Object(_.jsx)(N,{name:e.name,avatar:e.avatar})," ",Object(_.jsx)("div",{style:{fontSize:"0.8em",fontWeight:"bold",padding:"2px"}})]})}],["pass"===t.type,function(){return Object(_.jsx)("div",{})}])]}):Object(_.jsx)(L,{effect:t,state:n})}function D(e){var t=e.char,n=e.charHover,c=e.currentChar,i=e.onMouseEnter,o=e.onMouseLeave,u=e.onClick,l=t.id,d=t.hp,f=t.avatar,p=Object(r.useRef)(t);Object(r.useEffect)((function(){p.current=t}),[t]);var x=Object(r.useState)({x:t.x,y:t.y}),b=Object(s.a)(x,2),j=b[0],v=b[1];return function(e){var t=a.a.useRef(),n=a.a.useRef(),r=function r(a){if(void 0!==n.current){var c=a-n.current;e(c)}n.current=a,t.current=requestAnimationFrame(r)};a.a.useEffect((function(){return t.current=requestAnimationFrame(r),function(){return cancelAnimationFrame(t.current)}}),[])}((function(){var e=p.current;if(e.anim){var t=performance.now()-e.anim.startTime,n=Math.min(1,Math.max(0,t/500));if(e.anim.type===A.ANIM_MOVE)v({x:e.anim.from.x*(1-n)+e.anim.to.x*n,y:e.anim.from.y*(1-n)+e.anim.to.y*n});else if(e.anim.type===A.ANIM_ATTACK){var r=m(0,.5,n)*m(1,.5,n);v({x:e.x*(1-r)+(e.x+.5*e.anim.d.x)*r,y:e.y*(1-r)+(e.y+.5*e.anim.d.y)*r})}else if(e.anim.type===A.ANIM_ARROW){var a=m(0,.5,n)*m(1,.5,n);v({x:e.x*(1-a)+(e.x+.5*e.anim.d.x/e.anim.d.l)*a,y:e.y*(1-a)+(e.y+.5*e.anim.d.y/e.anim.d.l)*a})}1===n&&(e.anim=null)}else v(e)})),Object(_.jsxs)("div",{onMouseEnter:i,onMouseLeave:o,onClick:u,style:{position:"absolute",left:(.15+j.x)*S+"px",top:(.15+j.y)*S+"px",color:"#eee",fontWeight:500,background:n===l?"#fff":"#0000",width:"35px",height:"35px",boxShadow:c.id===l?"0px 0px 20px blue,0px 0px 5px #0009":"0px 0px 20px #0009",borderRadius:"50%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",userSelect:"none"},children:[" ",Object(_.jsx)("img",{style:{width:"30px"},src:f}),Object(_.jsx)("div",{style:{background:"#111",padding:"2px 1px 2px 2px",display:"flex"},children:Object(h.a)(Array(O).keys()).map((function(e){return Object(_.jsx)("div",{style:{width:"4px",height:"4px",borderRadius:"1px",margin:"0px 1px 0px 0px",transition:"300ms",background:y([0===d,"#000"],[e+1<=d,"green"],"#e00")}},e)}))})]},l)}var z=new p.a,F=n(11),H={w:14,h:14,tiles:"\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, \n  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, \n  1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, \n  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, \n  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,\n  1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,\n  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, \n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1\n".replace(" ","").split(",").map((function(e){return parseInt(e)}))},V=null;function G(e,t){return Y.apply(this,arguments)}function Y(){return(Y=Object(u.a)(d.a.mark((function e(t,n){var r,a,c,i,s;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("dispatch start",n.type),"tick"!==n.type){e.next=9;break}if("me"!==t.currentChar.user){e.next=6;break}return e.abrupt("return",t);case 6:return e.next=8,z.generateBestIAAction(t);case 8:n=e.sent;case 9:return r=F.cloneDeep(t),a=k(r,n,t.currentChar.user),c=a.cost,i=a.possible,s=a.effects,i&&(r.actions.push(Object(o.a)(Object(o.a)({computedAt:performance.now()},n),{},{char:r.currentChar,cost:c})),I(r,s,!0)),console.log("dispatch end"),e.abrupt("return",r);case 14:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var K=function(){var e=Object(r.useRef)(function(){var e=function(){return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)},t=[0,e(),e(),e(),e(),e()],n={lastEffectTime:performance.now(),map:H,chars:[{id:t[0],x:1,y:1,name:"foo",lastPlayedTurn:-1,user:"me",team:"ia",pa:10,avatar:"https://avatars.dicebear.com/api/bottts/"+t[0]+".svg",hp:O,cooldown:{}},{id:t[1],x:5,y:2,name:"bar",lastPlayedTurn:-1,user:"ia2",team:"ia2",pa:10,avatar:"https://avatars.dicebear.com/api/bottts/"+t[1]+".svg",hp:O,cooldown:{}},{id:t[2],x:5,y:5,name:"baz",lastPlayedTurn:-1,user:"ia3",team:"ia3",pa:10,avatar:"https://avatars.dicebear.com/api/bottts/"+t[2]+".svg",hp:O,cooldown:{}},{id:t[3],x:11,y:11,name:"zoo",lastPlayedTurn:-1,user:"ia4",team:"ia4",pa:10,avatar:"https://avatars.dicebear.com/api/bottts/"+t[3]+".svg",hp:O,cooldown:{}},{id:t[4],x:2,y:11,name:"moo",lastPlayedTurn:-1,user:"ia5",team:"ia5",pa:10,avatar:"https://avatars.dicebear.com/api/bottts/"+t[4]+".svg",hp:O,cooldown:{}}],actions:[],effects:[]};return n.nextChars=C(n),n.currentChar=n.nextChars[0],n}()),t=Object(r.useCallback)(function(){var t=Object(u.a)(d.a.mark((function t(n){return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!V){t.next=4;break}if(console.error("alreadyReducing !!!",V,"while starting",n),"tick"!==n.type){t.next=4;break}return t.abrupt("return");case 4:return V=n,t.next=7,G(e.current,n);case 7:e.current=t.sent,V=null,i(e.current);case 10:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),[]),n=Object(r.useState)(e.current),a=Object(s.a)(n,2),c=a[0],i=a[1];return Object(r.useEffect)((function(){setTimeout((function(){t({type:"tick"})}),500)}),[c]),Object(_.jsx)("div",{className:"App",children:Object(_.jsx)(T,{user:"me",state:c,do_action:t})})},B=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,37)).then((function(t){var n=t.getCLS,r=t.getFID,a=t.getFCP,c=t.getLCP,i=t.getTTFB;n(e),r(e),a(e),c(e),i(e)}))};i.a.render(Object(_.jsx)(a.a.StrictMode,{children:Object(_.jsx)(K,{})}),document.getElementById("root")),B()}},[[35,1,2]]]);
//# sourceMappingURL=main.89845d8f.chunk.js.map