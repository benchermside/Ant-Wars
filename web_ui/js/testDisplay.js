/*
 * This function will run some tests of hexClicked(). If it doesn't throw an exception then the
 * tests all pass.
 */
function testHexClicked() {
    function assertEqualArrays(testVal, expected) {
        if (!coordEqual(testVal, expected)) {
            throw Error(`assertion failed: ${testVal} != ${expected}`);
        }
    }
    const gameState = {terrainGrid: [[0,0,0], [0,0,0]]};
    const hexSize = 100;
    const tests = [
        [[17,9], null],
        [[36,17], [0,0]],
        [[62,18], [0,0]],
        [[85,11], null],
        [[85,11], null],
        [[116,10], null],
        [[137,16], [1,0]],
        [[15,51], [0,0]],
        [[76,64], [0,0]],
        [[113,59], [1,0]],
        [[176,59], [1,0]],
        [[216,58], [2,0]],
        [[10,108], null],
        [[35,98], [0,0]],
        [[66,95], [0,0]],
        [[88,102], [0,1]],
        [[117,106], [0,1]],
        [[22,144], null],
    ];
    tests.forEach(data => {
        assertEqualArrays( hexClicked(gameState, hexSize, data[0]), data[1]);
    });
}
testHexClicked(); // FIXME: Run at launch
