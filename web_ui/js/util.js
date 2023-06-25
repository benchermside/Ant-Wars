/*
 * Some essential utilities.
 */


/*
 * This is passed two different arrays of 2 numbers, or either of them can be null instead.
 * It returns true if the two arrays are equal (considering their values, not their identity)
 * or if both are null. If the arrays aren't of length 2 it will throw an exception.
 */
function coordEqual(coord1, coord2) {
    if (coord1 === null && coord2 === null) {
        return true;
    } else if (coord1 === null || coord2 === null) {
        return false;
    } else {
        // must be 2 arrays
        if (coord1.length !== 2 || coord2.length !== 2) {
            console.log ("coord1:",coord1);
            console.log ("coord2:",coord2);

            throw Error("Coordinate not of length 2");

        }
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}
