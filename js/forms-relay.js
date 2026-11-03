/* Временная отправка заявок на почту, пока CRM и сервер недоступны */
(function(){
  var TO='https://formsubmit.co/ajax/kvadro93.ru@yandex.ru';
  var RULES=[[/crm\.kvadro93\.ru\/api\/v1\/booking\/create/,'Бронь'],[/\/api\/order\/shop/,'Заказ из магазина'],[/\/api\/feedback\/shop/,'Вопрос из магазина'],[/\/api\/feedback\/?$/,'Обратная связь']];
  var L={service_id:'ID услуги',name:'Имя',phone:'Телефон',email:'Email',message:'Сообщение',date:'Дата',time:'Время',transfer:'Трансфер',address:'Адрес',adults:'Взрослых',childs:'Детей',peoples:'Человек',technics:'Техника',page:'Страница',url:'Ссылка',product:'Товар',access:'Аксессуары',color:'Цвет'};
  function fmt(d,kind){
    var o={_subject:kind+' с сайта kvadro93.ru'+(d.page?' — '+d.page:(d.product?' — '+d.product:'')),_template:'table',_captcha:'false'};
    for(var k in d){ if(!L[k]) continue; var v=d[k];
      if(k==='technics'){ v=(v||[]).map(function(t){return t.place+(t.teacher?' (с инструктором)':'')}).join('; '); }
      if(k==='transfer'){ v=v?'да':'нет'; }
      if(v===''||v==null||v==='0'||(k==='service_id')) continue; o[L[k]]=String(v); }
    if(!d.url) o['Ссылка']=location.href;
    return o;
  }
  var X=XMLHttpRequest.prototype, open=X.open, send=X.send;
  X.open=function(m,u){ this._relay=null; for(var i=0;i<RULES.length;i++){ if(RULES[i][0].test(String(u))&&/post/i.test(m)){ this._relay=RULES[i][1]; } } return open.apply(this,arguments); };
  X.send=function(body){
    if(!this._relay) return send.apply(this,arguments);
    var x=this, d={}; try{ d=typeof body==='string'?JSON.parse(body):(body||{}); }catch(e){}
    function done(ok){
      var resp=JSON.stringify(ok?{success:'no'}:{success:'error'});
      Object.defineProperty(x,'readyState',{value:4,configurable:true});
      Object.defineProperty(x,'status',{value:ok?200:500,configurable:true});
      Object.defineProperty(x,'statusText',{value:ok?'OK':'Error',configurable:true});
      Object.defineProperty(x,'responseText',{value:resp,configurable:true});
      Object.defineProperty(x,'response',{value:resp,configurable:true});
      Object.defineProperty(x,'responseURL',{value:TO,configurable:true});
      x.getAllResponseHeaders=function(){return 'content-type: application/json\r\n'};
      if(x.onreadystatechange) x.onreadystatechange();
      if(x.onloadend) x.onloadend();
    }
    if(d.homepage){ setTimeout(function(){done(true)},300); return; }
    fetch(TO,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(fmt(d,x._relay))})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){done(r.ok&&String(j.success)!=='false')})})
      .catch(function(){done(false)});
  };
})();
