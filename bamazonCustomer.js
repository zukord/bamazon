var mysql = require("mysql");
var inquirer = require("inquirer");

var itemArray = [];
var amountArray = [];
var itemNumber = 0;
var itemAmount = 0;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "item",
          type: "rawlist",
          choices: function() {
            for (var i = 0; i < results.length; i++) {
              itemArray.push(results[i].product_name);
            }
            return itemArray;
          },
          message: "Which item would you like to buy?"
        }
    ])
      .then(function(answer) {
          itemNumber = itemArray.indexOf(answer.item);
          itemAmount = results[itemArray.indexOf(answer.item)].stock_quantity
        inquirer
          .prompt([
            {
                name: "amount",
                type: "list",
                choices: function(){
                    for (var j=1; j < itemAmount + 1; j++) {
                        amountArray.push(j.toString());
                    }
                    return amountArray
                },
                message: "How many would you like?"
              }
            ])
            .then(function(answer){
                var quantity = answer.amount;
                var newAmount = itemAmount - quantity
                connection.query("UPDATE products SET stock_quantity = " + newAmount + " WHERE item_id = " + (itemNumber + 1), function(err, results) {
                    if (err) throw err;
                });
                console.log("There are " + (results[itemNumber].stock_quantity - quantity) + " remaining.");
                console.log("That will be " + (results[itemNumber].price * quantity) + " dollars. Thank you for shopping at Bamazon.");
                connection.end();
            });
    })
  })
}