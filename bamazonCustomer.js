const mysql = require('mysql');
const inquirer = require('inquirer');
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
const ask = () => {
    inquirer.prompt([{
        type: 'confirm',
        name: 'ask',
        message: 'Want to buy something else? (just hit enter for yes) \n',
        default: true
    }]).then((answer) => {
        if (answer.ask) {
            start();
        } else
            return console.log(`Bye!`);
    });
}

const start = () => {
    connection.query("SELECT * FROM products", (err, results) => {
        if (err) throw err;
        inquirer.prompt([{
                message: "What would you like to buy?",
                type: "list",
                name: "choice",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        let tableItem = `id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price}`
                        choiceArray.push(tableItem);
                    }
                    return choiceArray;
                },
            },
            {
                name: "howMany",
                type: "input",
                message: "How many would you like to buy?"
            }
        ]).then((answer) => {
            let converted = answer.choice.split('|');
            converted = converted[0].split(':');
            let chosenItem;
            let convertedChoice = parseInt(converted[1].trim());
            for (let i = 0; i < results.length; i++) {
                if (results[i].item_id === convertedChoice) {
                    chosenItem = results[i];
                }
            }
            if (chosenItem.stock_quantity > 0 && parseInt(answer.howMany) <= chosenItem.stock_quantity) {
                let purchaseTotal = chosenItem.price * parseInt(answer.howMany);
                connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: chosenItem.stock_quantity - parseInt(answer.howMany)
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    (error) => {
                        if (err) throw err;
                        console.log(`Purchase successful! Your total is: $${purchaseTotal} \n`);
                        return ask();
                    });
            } else {
                console.log("Sorry, not enough in stock! \n")
                return ask();
            }
        });
    });
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId} \n`);
    start();
});