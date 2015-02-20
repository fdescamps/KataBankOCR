/*User Story 1

You work for a bank, which has recently purchased an ingenious machine to assist in reading letters and faxes sent
in by branch offices. The machine scans the paper documents, and produces a file with a number of entries
which each look like this:
    _  _     _  _  _  _  _
  | _| _||_||_ |_   ||_||_|
  ||_  _|  | _||_|  ||_| _|

Each entry is 4 lines long, and each line has 27 characters. The first 3 lines of each entry contain an account number
written using pipes and underscores, and the fourth line is blank. Each account number should have 9 digits,
all of which should be in the range 0-9. A normal file contains around 500 entries.
Your first task is to write a program that can take this file and parse it into actual account numbers.*/

/*User Story 2

Having done that, you quickly realize that the ingenious machine is not in fact infallible.
Sometimes it goes wrong in its scanning. The next step therefore is to validate that the numbers
you read are in fact valid account numbers. A valid account number has a valid checksum.
This can be calculated as follows:

account number:  3  4  5  8  8  2  8  6  5
position names:  d9 d8 d7 d6 d5 d4 d3 d2 d1

checksum calculation:
(d1+2*d2+3*d3 +..+9*d9) mod 11 = 0

So now you should also write some code that calculates the checksum for a given number,
and identifies if it is a valid account number.
*/

var split = require("split");
var Transform = require("stream").Transform;
var util = require("util");
var fs = require('fs');

process.stdin.setEncoding("utf8"); // convert bytes to utf8 characters




// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}



var numberZero = [ [' ','_',' '], ['|', ' ','|'], ['|', '_','|'] ];
var numberOne = [ [' ',' ',' '], [' ', ' ','|'], [' ', ' ','|'] ];
var numberTwo = [ [' ','_',' '], [' ', '_','|'], ['|', '_',' '] ];
var numberThree = [ [' ','_',' '], [' ', '_','|'], [' ', '_','|'] ];
var numberFour = [ [' ',' ',' '], ['|', '_','|'], [' ', ' ','|'] ];
var numberFive = [ [' ','_',' '], ['|', '_',' '], [' ', '_','|'] ];
var numberSix = [ [' ','_',' '], ['|', '_',' '], ['|', '_','|'] ];
var numberSeven = [ [' ','_',' '], [' ', ' ','|'], [' ', ' ','|'] ];
var numberEight = [ [' ','_',' '], ['|', '_','|'], ['|', '_','|'] ];
var numberNine = [ [' ','_',' '], ['|', '_','|'], [' ', '_','|'] ];




util.inherits(ProblemStream, Transform); // inherit Transform

function ProblemStream () {
    Transform.call(this, { "objectMode": true }); // invoke Transform's constructor
    this.idxOfNum = 0;
    this.numLine = 0;
    this.alphanumbers = [];
    this.isBlankLine = false;
    for( var i = 0 ; i < 9 ; i++ ){
        this.alphanumbers[i] = [];
    }
}

ProblemStream.prototype._transform = function ( line, encoding, processed ) {
    //    _  _     _  _  _  _  _
    //  | _| _||_||_ |_   ||_||_|
    //  ||_  _|  | _||_|  ||_| _|
    //
    // we have to build 9 arrays of 3*3array
    //console.log( 'ligne a decoder : ' + line + ', line.length : ' + line.length + ', this.numLine:'+this.numLine);

    if( !this.isBlankLine ){
      var currentNumber = [];
      for( var i = 0 ; i < line.length ; i++ ){
        if( ( i>0 && (i%3) === 0 ) ){
          //console.log( '--> i=' + i + ', (i%3) ='+ (i%3) +' currentNumber : '+ this.idxOfNum +', line : '+ this.numLine + ', col : '+ i + ', part of the number : ' +  currentNumber.join( '' ) );
          this.alphanumbers[this.idxOfNum][this.numLine] = currentNumber;
          this.idxOfNum++;
          currentNumber = [];
        }
        currentNumber[i%3] = line[i];
        if( i === 26 ){
          this.alphanumbers[this.idxOfNum][this.numLine] = currentNumber;
        }
      }
      this.numLine++;
      this.idxOfNum=0;

      if( this.numLine%3 === 0 ){// All the data are read

        /*for( var i = 0 ; i < this.alphanumbers.length ; i++ ){
          var currentNumber = this.alphanumbers[i];
          for( var l = 0 ; l < currentNumber.length ; l++ ){
            console.log( '--> number : ' + i + ', line : '+ l + ' so : ' + currentNumber[l].join('') );
          }
        }*/
        this.numLine = 0;
        this.isBlankLine = true;
        this.push( this.alphanumbers );
      }
    }else{
      this.numLine = 0;
      this.isBlankLine = false;
    }

    processed(); // we're done processing the current line
};






util.inherits(SolutionStream, Transform);

function SolutionStream () {
    Transform.call(this, { "objectMode": true });
}

/*
 *. You need to check for all the constraints of Sudoku :
 * - check the sum on each row
 * - check the sum on each column
 * - check for sum on each box
 * - check for duplicate numbers on each row
 * - check for duplicate numbers on each column
 * - check for duplicate numbers on each box
*/
SolutionStream.prototype._transform = function ( problem, encoding, processed ) {

    var solution = solve( problem );
    //console.log( solution );
    this.push( solution );//when you push just a basic false the stream ends... WTF????.join('') + '\r\n'
    processed();

    function solve ( problem ) {
      var resultat = [];

      /*console.log("maski checking..");
      // print mask for number one
      for( var i = 0 ; i < numberOne.length ; i++ ){
        console.log( numberOne[i].join('') );
      }
      for( var i = 0 ; i < numberTwo.length ; i++ ){
        console.log( numberTwo[i].join('') );
      }
      for( var i = 0 ; i < numberThree.length ; i++ ){
        console.log( numberThree[i].join('') );
      }
      for( var i = 0 ; i < numberFour.length ; i++ ){
        console.log( numberFour[i].join('') );
      }
      for( var i = 0 ; i < numberFive.length ; i++ ){
        console.log( numberFive[i].join('') );
      }
      for( var i = 0 ; i < numberSix.length ; i++ ){
        console.log( numberSix[i].join('') );
      }
      for( var i = 0 ; i < numberSeven.length ; i++ ){
        console.log( numberSeven[i].join('') );
      }
      for( var i = 0 ; i < numberEight.length ; i++ ){
        console.log( numberEight[i].join('') );
      }
      for( var i = 0 ; i < numberNine.length ; i++ ){
        console.log( numberNine[i].join('') );
      }
      console.log("");*/

      // print what we read from file
      for( var i = 0 ; i < problem.length ; i++ ){
        if( numberOne.equals( problem[i] ) ){
            resultat.push( 1 );
        }else if( numberTwo.equals( problem[i] ) ){
            resultat.push( 2 );
        }else if( numberThree.equals( problem[i] ) ){
            resultat.push( 3 );
        }else if( numberFour.equals( problem[i] ) ){
            resultat.push( 4 );
        }else if( numberFive.equals( problem[i] ) ){
            resultat.push( 5 );
        }else if( numberSix.equals( problem[i] ) ){
            resultat.push( 6 );
        }else if( numberSeven.equals( problem[i] ) ){
            resultat.push( 7 );
        }else if( numberEight.equals( problem[i] ) ){
            resultat.push( 8 );
        }else if( numberNine.equals( problem[i] ) ){
            resultat.push( 9 );
        }else if( numberZero.equals( problem[i] ) ){
            resultat.push( 0 );
        }else{
          var currentNumber = problem[i];
          for( var k = 0 ; k < currentNumber.length ; k++ ){
            console.log( '----> can\'t read' + currentNumber[k].join('') );
          }
          resultat.push( 'X' );
        }
      }

      return resultat;
    }
};





util.inherits(CheckSumStream, Transform);
function CheckSumStream () {
    Transform.call(this, { "objectMode": true });
}

CheckSumStream.prototype._transform = function ( solution, encoding, processed ) {
    /*
    account number:  3  4  5  8  8  2  8  6  5
    position names:  d9 d8 d7 d6 d5 d4 d3 d2 d1

    checksum calculation:
    (d1+2*d2+3*d3 +..+9*d9) mod 11 = 0

    So now you should also write some code that calculates the checksum for a given number,
    and identifies if it is a valid account number.
    */
    //console.log( '---> We have to check sum for : ' + solution );
    var checked = check( solution );
    console.log( 'We have to check sum for : ' + solution + ' checked : ' + checked );
    this.push( ''+checked );//when you push just a basic false the stream ends... WTF????
    processed();

    function check ( problem ) {
      var dx = 0;
      var result = 0;
      var clonedReverseSol = solution.reverse().slice(0);;
      //console.log( '----> solution reverse : ' + clonedReverseSol );
      var checksums = [];
      for( var i = 0 ; i < clonedReverseSol.length ; i++ ){
        checksums[i] = ( i + 1 )*clonedReverseSol[i];
      }
      //console.log( '----> checksums du reverse : ' + checksums );
      result = checksums.reduce( function( valeurPrécédente, valeurCourante, index, array ){
        return valeurPrécédente + valeurCourante;
      });
      //console.log( '----> We have to check sum for : ' + solution + ' checked : ' + (result%11) );
      return result%11 === 0 ? true : false;
    }
};





util.inherits(FormatStream, Transform);
function FormatStream () {
  Transform.call(this, { "objectMode": true });
}

FormatStream.prototype._transform = function ( checked, encoding, processed ) {
  this.push( checked );
  processed();
};




console.log( "KATA 1 : Bank OC - Step 1" );
fs.createReadStream( "katabankOCR-data.js" )
    .pipe( split() )
    .pipe( new ProblemStream() )
    .pipe( new SolutionStream() )
    .pipe( new CheckSumStream() )
    .pipe( new FormatStream() )
    .pipe( process.stdout );
