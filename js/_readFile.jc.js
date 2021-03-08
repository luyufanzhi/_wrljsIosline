let _readFile_Diamond4 = {
	
	init : function (file , type){
		this.filepath = file;
		this._json = [];
		this._lon_line_num = 0;
		this._lat_line_num = 0;
		this._type = type;
		this._gjLon = 0;
		this._gjLat = 0;
		this._minLon = 0;
		this._minLat = 0;
	},
	start: function(){
		_this = this;
		$.ajaxSettings.async = false;
		$.get(_this.filepath , function(data){
			let _datasOnLine = data.split('\n'); 
			let _propertys = _datasOnLine[2].trim().split(/\s+/);  //属性配置
				_propertys2 = _datasOnLine[3].trim().split(/\s+/);
			let _gjLon = parseFloat(_propertys[0]),
				_gjLat = parseFloat(_propertys[1]),
				_startLon = parseFloat(_propertys[2]),
				_endLon = parseFloat(_propertys[3]),
				_startLat,
				_endLat;
				_this._lon_line_num = parseInt(typeof _propertys[6] == 'undefined' ? _propertys2[0] : _propertys[6]);
				_this._lat_line_num = parseInt(typeof _propertys[7] == 'undefined' ? _propertys2[1] : _propertys[7]);
				_this._gjLon = _gjLon;
				_this._gjLat = _gjLat;
				_mLon = (_gjLon+'').indexOf('.') != -1 ? (_gjLon+'').length - (_gjLon+'').indexOf('.') : '0';
				_mLat = (_gjLat+'').indexOf('.') != -1 ? (_gjLat+'').length - (_gjLat+'').indexOf('.') : '0';
			
			//if(_gjLat < 0){					// 仅针对lat 如果 格距为负值 数据从左下开始 即 90,30开始往上加
			//	_startLat = parseFloat(_propertys[5]);
			//	_endLat = parseFloat(_propertys[4]);
			//	_this._minLat = _startLat;
			//}else{							// 如果	格距为正值 数据从左上开始 即 90,50开始往下减
				_startLat = parseFloat(_propertys[4]),
				_endLat = parseFloat(_propertys[5]);
				_this._minLat = _endLat < _startLat ? _endLat : _startLat;
			//}
			// _startLat = parseFloat(_propertys[4]),
			// _endLat = parseFloat(_propertys[5]);
			
			
			
			_this._minLon = _startLon;
			
			let _b = true;
			for(let i = 3 ; i < _datasOnLine.length ; i++){
				if(!_b){
					break;
				}
				let _data = _datasOnLine[i].split(/\s+/);
				for(let p in _data){
					if(_data[p].trim() != ''){
						_this._json.push({
							lat : _startLat,
							lon : _startLon,
							val : _data[p]
						});
						_startLon = _this._jd(_startLon + _gjLon , _mLon);
						if(_this._jd(_startLon - _gjLon , _mLon)  == _endLon){
							_startLat = _this._jd(_startLat + _gjLat , _mLat);
							_startLon = parseFloat(_propertys[2]);
						}
						if(_this._json.length == _this._lon_line_num * _this._lat_line_num){
							_b = false;
							break;
						}
					}
				}
				
			}
		});
		$.ajaxSettings.async = true;
	},
	getJson: function(){
		return this._json;
	},
	getXSJson:function(h , l){
		//数据稀释	lon 201个  lat  161个
		let i = 0 , z = 0 ,b = true;
		let _arr = [];
		for(let p of this._json){
			if(i == 0 && b){
				_arr.push(p);
			}
			i++;
			z++;
			if(i == h || z % _lon_line_num == 0){		//间隔5个抽一个.  
				i = 0;
			}
			if(z == _lon_line_num * l){	//间隔3行抽一行
				b = !b;
				z = 0;
			}
			if(z == _lon_line_num && b){
				b = !b;
			}
		}
		return _arr;
	},
	_jd : function(f, d){
		let m = Math.pow(10 , d);
		return parseInt(f * m , 10) / m;
	},
	// 新增的绘图模块
	_draw : function(obj){
		_this = this;
		let _params = {
			_gjLon : _this._gjLon,
			_gjLat : _this._gjLat,
			_lat_line_num : _this._lat_line_num,
			_lon_line_num : _this._lon_line_num,
			_minLon : _this._minLon,
			_minLat : _this._minLat,
			_color : [[167,239,228],[170,237,211],[175,234,197],[165,229,179],[145,224,155],[125,216,127],[116,211,107],[112,206,90],[109,198,73],[108,193,56],[112,188,41],[116,181,27],[127,178,17],[255, 255, 255],[0,48,255],[0,121,255],[0,168,255],[0,204,255],[0,234,255],[0,255,198],[0,255,96], [150,255,0],[222,255,0], [255,252,0],[255,216,0],[255,186,0],[255,138,0],[255,102,0],[255,60,0],[255,0,0],[201,0,0],[149,0,0]],
			_level : [-72,-68,-64,-60,-56,-52,-48,-44,-40,-36,-32,-28,-24,-20,-16,-12,-8,-4,-2,0,4,8,12,16,18,20,24,28,32,36,40,45],
			_tar : '#canvas',
			_create : false,
			_alpha : 0.75,
			_json : _this._json,
			_tarwidth : 6000,
			
		}
		$.extend(_params, obj);
		let target = $(_params._tar),
			canvas,
			_canvasTarget;
		if(target[0] == null && !_params._create){
			alert('目标对象不存在, 请检查有没有准备这个canvas图层,或者修改_create属性自动创建');
		}else if(target[0] == null && _params._create){
			_target = document.createElement('canvas');
			_target.style.display = 'block';
			_target.height = _params._tarwidth / _params._lon_line_num * _params._lat_line_num;
			_target.width = _params._tarwidth;
			canvas = _target.getContext('2d');
			canvas.width = _params._tarwidth;
			canvas.height = _params._tarwidth  / _params._lon_line_num * _params._lat_line_num;
			//设置canvas透明度
			canvas.globalAlpha=_params._alpha;   
			_canvasTarget = _target;
		}else{
			canvas = target[0].getContext('2d');
			canvas.width = target[0].width;
			canvas.height = target[0].height;
			canvas.globalAlpha=_params._alpha;   
			_canvasTarget = target[0];
		}
		
		
		let _newjson = [] , i = 0 , _tempjson = [];
		for(let p of _params._json){
			i++;
			_tempjson.push(p);
			if(i == _params._lon_line_num){
				i = 0;
				_newjson.push(_tempjson);
				_tempjson = [];
			}
		}
		while(_newjson.length * _newjson[0].length < 100000){
			_newjson = _this._xhwg(_newjson) ;
		}
		
		for(let k in _newjson){
			for(let p of _newjson[k]){
				canvas.beginPath();
				
				canvas.fillStyle = _this._getColor(p.val , _params._level , _params._color);
				canvas.rect(
						_this._calcL(canvas , p.lon , _params._minLon , _params._lon_line_num , _params._gjLon , 'w'),
						_this._calcL(canvas , p.lat , _params._minLat , _params._lat_line_num , _params._gjLat , 'h'), 
						canvas.width / _params._lon_line_num , 
						canvas.height / _params._lat_line_num
						);
				canvas.fill();
			}
		}
		
		return _canvasTarget;
		
	},
	_calcL : function(tar , jwd , minjwd , numjwd , gjjwd , w){
		//return (lng - _minLon) * (target[0].width / _lon_line_num / _gjLon);
		
		//---  因为经纬度 lat  在北半球 从大到小, 所以正常绘图会出现图片上下颠倒的情况, 在这里根据lat格距的正负作为依据, 进行x轴反转
		
		jwd = gjjwd < 0 ? minjwd * 2 + (numjwd - 1) * Math.abs(gjjwd) - jwd : jwd;
		
		return  (jwd - minjwd) * ((w == 'w' ? tar.width : tar.height) / numjwd / Math.abs(gjjwd));
	},
	_getColor : function(num = 0 , _level , _color){
		for(p in _level){
			p = parseInt(p);
			if(p < _level.length){
				if(_level[p] <= parseInt(num) && _level[p+1] > parseInt(num)){
					return 'rgb(' + _color[p][0] + "," + _color[p][1] + "," + _color[p][2] + ")"; 
				}
			}else{
				return 'rgb(' + _color[p][0] + "," + _color[p][1] + "," + _color[p][2] + ")"; 
			}
		}
		return 'rgba(255,255,255,0)';
	},
	_xhwg : function(_newjson){
		let _newJson2 = [] , _tempjson2 = [] , _tempjson = [] , _newjson3 = [];
		for(let p in _newjson){
			_tempjson2 = [];
			for(let i = 0 ; i < _newjson[p].length ; i++){
				_tempjson2.push(_newjson[p][i]);
				
				if(i != _newjson[p].length - 1){
					_tempjson2.push({
						lat : _newjson[p][i].lat,
						lon : (parseFloat(_newjson[p][i].lon) + parseFloat(_newjson[p][i+1].lon)) / 2,
						val : (parseFloat(_newjson[p][i].val) + parseFloat(_newjson[p][i+1].val)) / 2
					});
				}
			}
			_newJson2.push(_tempjson2);
		}
		
		for(let i = 0 ; i < _newJson2.length ; i++){
			_newjson3.push(_newJson2[i]);
			_tempjson = [];
			if(i != _newJson2.length - 1){
				for(let k = 0 ; k < _newJson2[i].length ; k++){
					_tempjson.push({
						lat : (parseFloat(_newJson2[i][k].lat) + parseFloat(_newJson2[i+1][k].lat)) / 2,
						lon : _newJson2[i][k].lon,
						val : (parseFloat(_newJson2[i][k].val) + parseFloat(_newJson2[i+1][k].val)) / 2
					})
				}
				_newjson3.push(_tempjson);
			}
		}
		
		return _newjson3;
	}
}

function _readFileDiamond4() {
     this.init.apply(this, arguments);
	 this.start();
}
_readFileDiamond4.prototype = _readFile_Diamond4;