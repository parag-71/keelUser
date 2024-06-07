export class Util {
    utoa(str:any) {
		return window.btoa(unescape(encodeURIComponent(str)));
	}
    atou(str:any) {
		return decodeURIComponent(escape(window.atob(str)));
	}
    getLoginUser() {
		let user: any = localStorage.getItem('user_details') != "undefined" ? (localStorage.getItem('user_details')) : null;
		if (user) {
			user = JSON.parse(this.atou(user));
		}
		return user;
	}
	setLoginUser(data:any) {
		let enc = this.utoa(JSON.stringify(data));
		!data.rememberMe ? sessionStorage.setItem('rememberMe','session') : ''
		localStorage.setItem('user_details', enc);
	}
	getIndexOfArrayData(data:any, property:any, value:any) {
		let result = -1;
		data.some(function (item:any, i:any): any {
			if (item[property] === value) {
				result = i;
				return true;
			}
		});
		return result;
	}
}
