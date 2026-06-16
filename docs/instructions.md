# Questions

## Question 1

Create a page that displays a list of all the games provided in the game-data.json file. Use the thumb.url property to display the game thumbnails. The games must be loaded from the Back-End using a REST API endpoint.

## Question 2

Create a search functionality.
● When the user types into the search bar, the game list should update accordingly.
● The games must be filtered on the back-end using a REST API endpoint.

## Question 3

Consider a Slot machine defined like this:
● Reel 1: [“cherry”, ”lemon”, “apple”, ”lemon”, “banana”, “banana”, ”lemon”, ”lemon”]
● Reel 2: [”lemon”, “apple”, ”lemon”, “lemon”, “cherry”, “apple”, ”banana”, ”lemon”]
● Reel 3: [”lemon”, “apple”, ”lemon”, “apple”, “cherry”, “lemon”, ”banana”, ”lemon”]

The user starts with 20 coins. Each spin will cost the user 1 coin.

### Rewards

● 3 cherries in a row: 50 coins
● 2 cherries in a row: 40 coins
● 3 apples in a row: 20 coins
● 2 apples in a row: 10 coins
● 3 bananas in a row: 15 coins
● 2 bananas in a row: 5 coins
● 3 lemons in a row: 3 coins

Note: A match is only valid if it is in order from left to right.
For example:

● Apple, Cherry, Apple – no win
● Apple, Apple, Cherry – win

Create an endpoint that returns the result of the spin and the coins the player won/lost. Additionally, the user's balance should be updated after every spin.

Note: The balance and spins should not be stored in a database. Return the updated balance in the response from the used endpoint.

## Question 4

In the REST API endpoints, use any middleware you deem necessary to make the endpoints more robust. Clearly mark the code that addresses this.

## Question 5

Given that the search functionality filters on every keystroke, the back-end performance is starting to degrade. Find ways to reduce the number of hits and/or optimise the search endpoint. Mark clearly the code that solves this issue.

## Question 6

Add a button that converts the current balance to another currency for display purposes only. The button should simply convert the balance using an external API, such as https://www.exchangerate-api.com/docs/standard-requests.

## Question 7

Use the following description to design a schema for a database that stores this information:

You are working on an online casino platform. A casino has games. Each game has a unique type. Each game is available in one or more countries where players are allowed to play. A player may or may not have a favourite game. Every spin on any game should be recorded, including the amount of money won or lost.

Create the schema and write the SQL statements to create the database and tables.
