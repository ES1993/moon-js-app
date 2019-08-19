import { mjsApp } from '../example';

test('test', () => {
  

  const tempfun=()=>{
    let temp=''
    for(let i=0;i<1000000;i++){
      temp+='qw'
    }
    return temp
  };
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
			*list(a,b) {
        const {call,mSelect}=a;
        console.log("m1 list");
        const s=yield mSelect('m');
        console.log('333=',s);
			},
			*fetch() {
				console.log("m1 fetch");
      },
      *ly1({call}){
       const re= yield call(tempfun);
      //  console.log(re)
        console.log("m1 ly1");
      },
      *ly2(){
        console.log("m1 ly2");
      },
      *ly({mPut,take}){
        yield mPut('m1/ly1');
        yield take('m1/ly1/@@end');
        yield mPut('m1/list');
        yield mPut('m1/ly2');
      }
		}
	};

	
	mjsApp.models([m1]);
	mjsApp.onError(e=>{
		console.log(e);
	});
	mjsApp.start();

	mjsApp.conf.store.dispatch({ type: 'm1/ly' });

});