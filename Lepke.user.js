// ==UserScript==
// @name         Lepke
// @namespace    http://torusz.hu/gm
// @description  Kiegészítők a Moly.hu oldalhoz
// @include      http://moly.hu/*
// @include      http://www.moly.hu/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @version      6.1
// @updateURL    https://github.com/petamas/Lepke/raw/master/Lepke.user.js
// @downloadURL  https://github.com/petamas/Lepke/raw/master/Lepke.user.js
// @run-at       document-start
// @icon         https://github.com/petamas/Lepke/raw/master/images/Lepke64.png
// ==/UserScript==

// Készítette: Peregi Tamás (@petamas)
// Kérdésekkel, problémákkal a molyos zónában keress: http://moly.hu/zonak/molyos-bongeszo-kiegeszitok

//=============================================================================
// Segédfüggvények
//=============================================================================

//var lepke__icon = 'https://raw.githubusercontent.com/petamas/Lepke/master/images/Lepke_kicsi.png';
var lepke__icon = 'https://github.com/petamas/Lepke/raw/master/images/Lepke64.png';
var lepke__manifestURL = 'https://github.com/petamas/Lepke/raw/master/manifest.json';
var lepke__downloadURL = 'https://github.com/petamas/Lepke/raw/master/Lepke.user.js';
var lepke__downloadPageURL = 'https://github.com/petamas/Lepke/';
var lepke__modules = {logger: true, regebbi_peldany: true, hozzaszolasok: true, kihivas_kukac: true, esemeny_kukac: true, spoileropen: false};

function alert_real(text) {
	window.alert(text);
}

function alert_debug(text) {
	window.alert(text);
}

function new_xmlhttp() {
	if (window.XMLHttpRequest) {
		//code for IE7+, Firefox, Chrome, Opera, Safari
		return new XMLHttpRequest();
	} else {
		//code for IE6, IE5
		return new ActiveXObject('Microsoft.XMLHTTP');
	}
}

function lepke__get_user_link() {
	var menu = document.getElementById('user_menu');
	if(menu==undefined)
		return '';
	var link = menu.getElementsByTagName('a')[0];
	var url  = link.href;
	return url;
}
 
function lepke__get_user() {
	var url = lepke__get_user_link();
	if(url == '')
		return '';
	var user = url.replace(/.*\/tagok\//,'');
	return user;
}

function lepke__get_menu() {
	var mymenu = document.getElementById('lepke_menu');
	if(mymenu == undefined) {
		var header = document.getElementById('header_right_menu');
		mymenu = document.createElement('li');
		mymenu.innerHTML = '<a href="#"><img src="'+lepke__icon+'" class="inline_avatar" height="32"/></a><ul></ul>';
		mymenu.id = 'lepke_menu';
		mymenu.className = 'submenu';
		mymenu.getElementsByTagName('a')[0].addEventListener('click',settings__open);
		header.insertBefore(mymenu, header.firstChild);
	}
	return mymenu.getElementsByTagName('ul')[0];
}

function lepke__createMenuItem(title,link,handler) {
	var li = document.createElement('li');
	li.innerHTML = '<a href="'+link+'">'+title+'</a>';
	li.firstChild.addEventListener("click",handler,false);
	return li;
}

function is_GM() {
	return typeof GM_info !== 'undefined';
}

function is_chrome() {
	return typeof chrome !== 'undefined';
}


function lepke__version() {
	if(is_GM()) {
		return GM_info.script.version;
	} else if(is_chrome()) {
		return chrome.runtime.getManifest().version;
	} else {
		return '??';
	}
}


function lepke__edition() {
	if(is_GM()) {
		if(typeof chrome !== 'undefined') {
			return 'TM';
		} else {
			return 'GM';
		}
	} else if(is_chrome()) {
		return 'GC';
	} else {
		return '??';
	}
}



//=============================================================================
// GM_*
//=============================================================================

var lepke__keyPrefix = 'lepke__';

function MY_getValue(key,def) {
	//alert('MY_getValue('+key+','+def+')');
	var value = localStorage.getItem(key);
	if(value!=null) {
		localStorage.removeItem(key);
		MY_setValue('old__'+key,value);
	}
	value = localStorage.getItem(lepke__keyPrefix+key);
	var ret = value!=null ? value : def;
	//alert('return '+value+'->'+ret);
	return (ret);
};

function MY_setValue(key,value) {
	//alert('MY_setValue('+key+','+value+')');
	localStorage.setItem(lepke__keyPrefix+key, value);
};

function MY_deleteValue(key) {
	localStorage.removeItem(lepke__keyPrefix+key);
};

function MY_listValues() {
	var list = [];
	var reKey = new RegExp('^' + lepke__keyPrefix);
	for (var i = 0, il = window.localStorage.length; i < il; i++) {
			var key = window.localStorage.key(i);
			if (key.match(reKey)) {
					list.push(key.replace(lepke__keyPrefix, ''));
			}
	}
	return list;
};

function MY_xmlhttpRequest(details) {
	var allowed_keys = ["onreadystatechange", "method", "url", "synchronous"];
	for(var key in details) {
		if(allowed_keys.indexOf(key)==-1) {
			alert_real("Unsupported XHR key: "+key);
			return;
		}
	}
	if(is_GM()) {
		GM_xmlhttpRequest(details);
	} else {
		var xmlhttp = new_xmlhttp();
		xmlhttp.onreadystatechange=function() {details.onreadystatechange(xmlhttp);};
		xmlhttp.open(details.method,details.url,!details.synchronous);
		xmlhttp.send();
	}
}

//=============================================================================
// Store frissítése
//=============================================================================

function store__add_old_to_new(key) {
	var oldkey  = 'old__'+key;
	var current = parseInt(MY_getValue(key,0));
	var old     = parseInt(MY_getValue(oldkey,0));
	MY_setValue(key,current+old);
	MY_deleteValue(oldkey);
}

function store__set_old_from_new(key,def) {
	var oldkey  = 'old__'+key;
	var current = MY_getValue(key,def);
	var old     = MY_getValue(oldkey,current);
	MY_setValue(key,old);
	MY_deleteValue(oldkey);
}

function store__update() {
	var currentlevel = 1;
	if(MY_getValue('store_version',0)<currentlevel) {
		for(var mod in lepke__modules) {
			// update from old Chrome Version
			store__set_old_from_new('enable_'+mod, lepke__modules[mod]?1:0);
			store__add_old_to_new(mod);
			store__add_old_to_new('count_'+mod);
			// update from old logger
			var count = MY_getValue(mod,0);
			logger__log_ex(mod,count);
			MY_deleteValue(mod);
		}
		store__set_old_from_new('first_install', lepke__modules[mod]?1:0);
		MY_setValue('store_version',currentlevel);
	}
}

//=============================================================================
// Beállítások
//=============================================================================

function settings__load() {
	for(var mod in lepke__modules) {
		var key = 'enable_'+mod;
		var def = lepke__modules[mod] ? 1 : 0;
		var raw = MY_getValue(key,def);
		var val = parseInt(raw);
		//alert(key +'=' + raw + ' ('+def+')');
		lepke__modules[mod] = val==1 ? true : false;
	}
}

function settings__save() {
	for(var mod in lepke__modules) {
		var key = 'enable_'+mod;;
		var val = lepke__modules[mod] ? 1 : 0;
		MY_setValue(key,val);
	}
}

function settings__close() {
	var x = document.getElementsByClassName('modal-background')[0];
	x.parentNode.removeChild(x);
	var y = document.getElementsByClassName('modal-window')[0];
	y.parentNode.removeChild(y);
}

function settings__ok() {
	for(var mod in lepke__modules) {
		lepke__modules[mod] = document.getElementById('lepke_enable_'+mod).checked;
	}
	settings__save();
	settings__close()
}

function add_i_tag(s) {
	var r = /_[^_]*_/
	while(r.test(s)) {
		var m = r.exec(s)[0];
		s = s.replace(m,'<i>'+m.replace(/_/g,'')+'</i>');
	}
	return s;
}

function settings__line(mod,title,desc) {
	var xcheck = '<input type="checkbox" id="lepke_enable_'+mod+'"/>';
	var xtitle = '<b>'+add_i_tag(title)+'</b>';
	var xdesc  = desc != '' ? '<br/>'+add_i_tag(desc) : '';
	return '<tr><td>'+xcheck+'</td><td>'+xtitle+xdesc+'</td></tr>';
}

function settings__open() {
	var background = document.createElement('div');
	background.className = 'modal-background';

	var modal = document.createElement('div');
	modal.className = 'modal-window';
	modal.innerHTML = '<div class="modal-content"><div class="modal-close"><a href="#"><img src="/modal/closelabel.png" alt=""></a></div><div class="pjax" id="pjax"></div>	</div>';
	modal.style.top = '55px';
	
	var version = 'v'+lepke__version()+' ('+lepke__edition()+')';
	var x = '';
	x += '<h1>Lepke beállítások &ndash; '+version+'</h1>';
	x += '<form><table>';
	x += settings__line('logger','Használati statisztika készítése','Ha be van kapcsolva, a Lepke számolja, hogy melyik funkcióját mennyit használod. Egy későbbi verzió ezt az adatot _anonim módon_ eljuttatja majd hozzám. (Jelenleg csak a te gépeden tárolódnak a számok.) Ezekből az adatokból látom, hogy melyik funkciót érdemes fejleszteni/karbantartani. Kérlek, engedélyezd a statisztika készítését!');
	x += settings__line('regebbi_peldany','_Régebbi példány_ gomb hozzáadása a könyvadatlapokhoz','Működése megegyezik a _Hozzáadás_ menü _Korábbi saját példány_ menüpontjának működésével, de nem kérdez rá, hogy melyik évben szerezted meg. Az így felvett könyvek nem jelennek meg a figyelőid frissében.');
	x += settings__line('hozzaszolasok','_Hozzászólások_ menüpont hozzáadása a _Profilom_ menühöz','Sokan hiányolták, köztük én is, most már újra van. :)');
	x += settings__line('kihivas_kukac','_Résztvevők kukacolása_ gomb hozzáadása kihívásokhoz','A gombra kattintva megjelenik egy kukacolt lista az összes résztvevőről ill. külön a teljesítőkről és a nem teljesítőkről, amit könnyedén be lehet másolni egy hozzászólásba, ha valamiért meg akarod szólítani a résztvevőket. Nem csak a kihívásgazdának, hanem mindenkinek működik.');
	x += settings__line('esemeny_kukac','_Résztvevők kukacolása_ gomb hozzáadása eseményekhez','A gombra kattintva megjelenik egy kukacolt lista az esemény résztvevőiről, amit könnyedén be lehet másolni egy hozzászólásba, ha valamiért meg akarod szólítani őket. Nem csak az esemény tulajdonosának, hanem mindenkinek működik.');
	x += settings__line('spoileropen','Spoileres tartalmak automatikus megnyitása.','Elavult funkció, most már a Moly alapból támogatja. (A profilodon lévő fogaskerékre kattintva a _Működés_ fül alatt pipáld ki a _Cselekményleírásos tartalmak mutatása_ sort.) A Lepkében érzelmi okokból szerepel, használni nem érdemes.');
	x += '</table>';
	x += '<input type="submit" id="lepke_settings_ok" value="OK">';
	x += '</form>';
	document.body.appendChild(background);
	
	modal.getElementsByClassName('pjax')[0].innerHTML = x;
	document.body.appendChild(modal);
	modal.style.left = (window.innerWidth-modal.offsetWidth)/2 + 'px';
	
	for(var mod in lepke__modules) {
		document.getElementById('lepke_enable_'+mod).checked = lepke__modules[mod];
	}
	
	document.getElementsByClassName('modal-close')[0].firstChild.addEventListener('click', settings__close);
	document.getElementById('lepke_settings_ok').addEventListener('click', settings__ok);
}

function settings__setup() {
	settings__load();
	var settings = lepke__createMenuItem('Beállítások', '#', settings__open);
	lepke__get_menu().appendChild(settings);
}

//=============================================================================
// Frissítés
//=============================================================================

function update__newer(v1,v2) {
	var v1parts = v1.split('.');
	var v2parts = v2.split('.');
	while (v1parts.length < v2parts.length) v1parts.push("0");
	while (v2parts.length < v1parts.length) v2parts.push("0");
	v1parts = v1parts.map(Number);
	v2parts = v2parts.map(Number);
	for(var i = 0; i<v1parts.length; i++)
		if(v1parts[i]!=v2parts[i])
			return v1parts[i]>v2parts[i];
	return false;
}

function update__look(alert_if_nothing) {
	MY_xmlhttpRequest({
		method: "GET",
		url: lepke__manifestURL,
		synchronous: false,
		onreadystatechange: function(response) {
			if (response.readyState==4 && response.status==200){
				var manifest = JSON.parse(response.responseText);
				MY_setValue('last_update_check',new Date().toString());
				if(update__newer(manifest.version,lepke__version())) {
					var r = window.confirm('Új Lepke verzió érhető el. Szeretnéd a jelenlegi '+lepke__version()+' verziót '+manifest.version+' verzióra frissíteni?');
					if(r) {
						location.href = is_GM() ? lepke__downloadURL : lepke__downloadPageURL;
					}
				} else if(manifest.version==lepke__version()){
					if(alert_if_nothing) alert_real('A legfrissebb verziót használod.');
				} else {
					alert_real('Frissebb a verziód, mint a hivatalos.');
				}
			}
		}
	});
}

function update__setup() {
	lepke__get_menu().appendChild(lepke__createMenuItem('Új verzió keresése', '#', function(){update__look(true);}));
	
	var last_update_check = MY_getValue('last_update_check','');
	if(last_update_check == '' || new Date(last_update_check).toDateString() != new Date().toDateString()) {
		update__look(false);
	}
}

//=============================================================================
// Modul: logger
//=============================================================================

function logger__log_ex(mod,inc) {
	if(!lepke__modules.logger)
		return;

	var key = 'count_'+mod;
	var current = parseInt(MY_getValue(key,0));
	current += parseInt(inc);
	MY_setValue(key,current);
	//window.alert(key + '='+ current);
}

function logger__log(mod) {
	logger__log_ex(mod,1);
}

function logger__show() {
	var keys = MY_listValues();
	var data = new Object();
	for(var i =0; i<keys.length; i++) {
		data[keys[i]] = MY_getValue(keys[i]);
	}
	alert_real(JSON.stringify(data,null,'  '));
}

function logger__setup() {
	var first = MY_getValue('first_install','');
	if(first=='') {
		MY_setValue('first_install',new Date().toString());
	}
	
	var show = lepke__createMenuItem('Tárolt adatok', '#', logger__show);
	lepke__get_menu().appendChild(show);
}

//=============================================================================
// Modul: regebbi__peldany
//=============================================================================

function regebbi_peldany__setup() {
	if(new RegExp('^http://(www)?moly.hu/konyvek/.+$').test(document.location.href)) {
		var buttons = document.getElementsByClassName('button_to');
		for(var b=0;b<buttons.length;b++) {
			if(buttons[b].action.search('/magankonyvtar')!=-1) {
				var div = buttons[b].parentNode
				var clone = div.cloneNode(true);
				div.getElementsByTagName('input')[0].value='Régebbi példány';
				div.getElementsByTagName('form')[0].action = div.getElementsByTagName('form')[0].action + '&copy%5Bis_earlier%5D=true';
				div.getElementsByTagName('form')[0].addEventListener('submit',function(){logger__log('regebbi_peldany');})
				div.parentNode.insertBefore(clone,div);
				break;
			}
		}
	}
}

//=============================================================================
// Modul: hozzaszolasok
//=============================================================================

function hozzaszolasok__setup() {
	var ul = document.getElementById('user_menu').getElementsByTagName('ul')[0];
	ul.appendChild(lepke__createMenuItem('Hozzászólások', lepke__get_user_link()+'/hozzaszolasok', function(){logger__log('hozzaszolasok');}));
}

//=============================================================================
// Modul: kihivas_kukac
//=============================================================================

var kihivas_kukac__open;
 
function kihivas_kukac__refresh() {
	kihivas_kukac__open = !kihivas_kukac__open;
	if(!kihivas_kukac__open)
		return;
	
	logger__log('kihivas_kukac');
	document.getElementById('lepke_kihivas_resztvevok').innerHTML = 'Betöltés...';
	var xmlhttp = new_xmlhttp();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			var xmldoc = (new DOMParser).parseFromString(xmlhttp.responseText,'text/html');
			var table = xmldoc.getElementById('pjax').getElementsByTagName('table')[0];
			var tr = table.getElementsByTagName('tr');
			var resztvevok = ''; var resztvevok_szama = 0;
			var teljesitok = ''; var teljesitok_szama = 0;
			var nem_teljesitok = ''; var nem_teljesitok_szama = 0;
			for(var i = 1; i<tr.length; i++) {
				var link = tr[i].getElementsByTagName('a')[0];
				var ref = ', @<a href="'+link.getAttribute('href')+'">' + link.innerHTML + '</a>';
				var td = tr[i].lastChild;
				 
				if(td.getElementsByClassName('completed').length > 0 || td.getElementsByClassName('on').length > 0) {
					teljesitok += ref;
					teljesitok_szama += 1;
				} else {
					nem_teljesitok += ref;
					nem_teljesitok_szama += 1;
				}
				resztvevok += ref;
				resztvevok_szama += 1;
			}
			document.getElementById('lepke_kihivas_resztvevok').innerHTML =
				'<p><b>Résztvevők ('+resztvevok_szama+'):</b> ' + resztvevok.substring(2) + '</p>' +
				'<p><b>Teljesítők ('+teljesitok_szama+'):</b> ' + teljesitok.substring(2) + '</p>' +
				'<p><b>Nem teljesítők ('+nem_teljesitok_szama+'):</b> ' + nem_teljesitok.substring(2) + '</p>';
		}
	}
	xmlhttp.open('GET',location.href + '/teljesitesek',true);
	xmlhttp.send();
}
 
function kihivas_kukac__setup() {
	if(new RegExp('^http://(www)?moly.hu/kihivasok/[^\/]+$').test(document.location.href)) {
			var container = document.getElementsByClassName('add_comment_button')[0];
			var button = document.createElement('div');
			button.setAttribute('class','formbutton');
			button.innerHTML = '<a href="#">Résztvevők kukacolása</a><div id="lepke_kihivas_resztvevok">Ideiglenes érték</div>';
			button.getElementsByTagName('a')[0].addEventListener('click', kihivas_kukac__refresh, false);
			container.insertBefore(button, container.lastChild);
			kihivas_kukac__open = false;
	}
} 

//=============================================================================
// Modul: esemeny_kukac
//=============================================================================

var esemeny_kukac__open;
 
function esemeny_kukac__refresh() {
	esemeny_kukac__open = !esemeny_kukac__open;
	if(!esemeny_kukac__open)
		return;
	
	logger__log('esemeny_kukac');
	document.getElementById('lepke_esemeny_resztvevok').innerHTML = 'Betöltés...';
	
	var text = document.getElementsByClassName('event')[0].getElementsByClassName('text')[0];
	var linkek = text.nextSibling.getElementsByClassName('user_selector');
	
	var resztvevok = '';
	var resztvevok_szama = 0;
	for(var i = 0; i<linkek.length; i++) {
		var link = linkek[i];
		var ref = ', @<a href="'+link.getAttribute('href')+'">' + link.innerHTML + '</a>';
		resztvevok += ref;
		resztvevok_szama += 1;
	}
	
	var result = '<b>Résztvevők ('+resztvevok_szama+'):</b> ' + resztvevok.substring(2);
	
	document.getElementById('lepke_esemeny_resztvevok').innerHTML = '<p>'+result+'</p>';
}
 
function esemeny_kukac__setup() {
	if(new RegExp('^http://(www)?moly.hu/esemenyek/[^\/]+$').test(document.location.href)) {
			var container = document.getElementsByClassName('add_comment_button')[0];
			var button = document.createElement('div');
			button.setAttribute('class','formbutton');
			button.innerHTML = '<a href="#">Résztvevők kukacolása</a><div id="lepke_esemeny_resztvevok">Ideiglenes érték</div>';
			button.getElementsByTagName('a')[0].addEventListener('click', esemeny_kukac__refresh, false);
			container.insertBefore(button, container.lastChild);
			esemeny_kukac__open = false;
	}
} 


//=============================================================================
// Modul: spoileropen
//=============================================================================

function spoileropen__setup() {
	GM_addStyle('.spoiler_box > div { display: block !important; }');
	GM_addStyle('.spoiler { background: url(/assets/menu-expanded.gif) no-repeat -1px 3px !important; }');
}

//=============================================================================
// Egyebek
//=============================================================================

function main() {
	if(lepke__get_user()=='')
		return;

	store__update();
	settings__setup();
	update__setup();
	
	if(lepke__modules.logger)
		logger__setup();

	if(lepke__modules.spoileropen)
		spoileropen__setup();

	if(lepke__modules.regebbi_peldany)
		regebbi_peldany__setup();

	if(lepke__modules.hozzaszolasok)
		hozzaszolasok__setup();

	if(lepke__modules.kihivas_kukac)
		kihivas_kukac__setup();
		
	if(lepke__modules.esemeny_kukac)
		esemeny_kukac__setup();
}

window.addEventListener('DOMContentLoaded', main);

// VÉGE