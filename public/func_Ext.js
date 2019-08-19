/*
封装一些扩展方法
*/

//数组扩展方法
Array.prototype.clear = function () {
  this.splice(0, this.length);
};
Array.prototype.contains = function (obj) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};
Array.prototype.convertAll = function (converter) {
  var list = new Array();
  for (var i = 0; i < this.length; i++) {
    list.add(converter(this[i]));
  }
  return list;
};
Array.prototype.remove = function (predicate) {
  for (var i = 0; i < this.length; i++) {
    if (predicate(this[i])) {
      this.splice(i, 1);//移除这个索引的元素
    }
  }
};
Array.prototype.removeAt = function (index) {
  if ((this[index])) {
    this.splice(index, 1);//移除这个索引的元素
  }
};
Array.prototype.find = function (predicate) {
  for (var i = 0; i < this.length; i++) {
    if (predicate(this[i])) {
      return this[i];
    }
  }
  return null;
};
Array.prototype.findAll = function (predicate) {
  var results = new Array();
  for (var i = 0; i < this.length; i++) {
    if (predicate(this[i])) {
      results.add(this[i]);
    }
  }
  return results;
};
Array.prototype.findIndex = function (predicate, index) {
  if (index === void 0) { index = 0; }
  for (var i = index || 0; i < this.length; i++) {
    if (predicate(this[i])) {
      return i;
    }
  }
  return -1;
};
Array.prototype.findLastIndex = function (predicate, index) {
  if (index === void 0) { index = this.length; }
  for (var i = index; i > -1; i--) {
    if (predicate(this[i])) {
      return i;
    }
  }
  return -1;
};
Array.prototype.forEach = function (action) {
  for (var i = 0; i < this.length; i++) {
    if(action(this[i])==false){
      break;
    }
  }
};
Array.prototype.where = function (action) {
  var itemarrar=new Array();
  for (var i = 0; i < this.length; i++) {
    if(action(this[i])){
      itemarrar.push(this[i]);
    }
  }
  return itemarrar;
};
Array.prototype.select = function (action) {
  var itemarrar = new Array();
  for (var i = 0; i < this.length; i++) {
      itemarrar.push(this[i]);
  }
  return itemarrar;
};
Array.prototype.distinct = function () {
  var res = [];
  var json = {};
  for (var i = 0; i < this.length; i++) {
    if (!json[this[i]]) {
      res.push(this[i]);
      json[this[i]] = 1;
    }
  }
  return res;
}

// //除法
// Number.prototype.accDiv=function(arg2) {
//   var arg1=this;
//   var t1 = 0, t2 = 0, r1, r2;
//   try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
//   try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
//   with (Math) {
//     r1 = Number(arg1.toString().replace(".", ""))
//     r2 = Number(arg2.toString().replace(".", ""))
//     return accMul((r1 / r2), pow(10, t2 - t1));
//   }
// }
// //乘法 
// Number.prototype.accMul = function (arg2) {
//   var arg1 = this;
//   var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
//   try { m += s1.split(".")[1].length } catch (e) { }
//   try { m += s2.split(".")[1].length } catch (e) { }
//   return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
// }
//加法  
Number.prototype.accAdd = function (arg2) {
  var arg1 = this;
  var r1, r2, m;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}
//减法  
Number.prototype.Subtr = function(arg2){
  var arg1 = this;
  var r1, r2, m, n;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}