let arr = new Array(260000).fill(0);

// forループ
console.time('for loop');
for (let i = 0; i < arr.length; i++) {
    arr[i] = 1;
}
console.timeEnd('for loop');

// forEachメソッド
console.time('forEach loop');
arr.forEach((item, index) => {
    arr[index] = 1;
});
console.timeEnd('forEach loop');