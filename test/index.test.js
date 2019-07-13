import { mjsApp } from '../src';

test('test', () => {
	const m1 = {
		name: "m1",
		state: {
			name: "m1 name",
			age: "m1 age"
		},
		reducers: {
			change(state, action) {
				console.log("m1 change");
				return { ...state, ...action.payload };
			},
			add(state, action) {
				console.log("m1 add");
				return { ...state, ...action.payload };
			},
			sub(state, action) {
				console.log("m1 sub");
				return { ...state, ...action.payload };
			},
		},
		effects: {
			*list({call,mSelect}) {
        console.log("m1 list");
        const s=yield mSelect('m122');
        console.log('333=',s);
				yield call(this.fetch,"https://redux-saga-in-chinese.js.org/21");
			},
			*fetch() {
				console.log("m1 fetch");
			}
		}
	};

	
	mjsApp.models([m1]);
	mjsApp.onError(e=>{
		console.log(e);
	});
	mjsApp.start();

	mjsApp.conf.store.dispatch({ type: 'm1/list' });

});