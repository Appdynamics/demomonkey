# DemoMonkey
Tamper your application's UI to demo anything

***Note:*** *This is still a alpha version. Many core features might not work properly. Please help to improve DemoMonkey by giving back your feedback.*

## Introduction
Giving custom demos in the verticals of your prospects, shows them that you understand their specific requirements and that you did our homework. Although building meaningful demos is a time-consuming task, so not every demo is setup in the environment of our customers. DemoMonkey gives you a simple way of building custom demos for HTML5 based application. By providing text replacements you can go within minutes from an e-commerce demo application to a customer care center or flight booking service.

## Usage
DemoMonkey is driven by __configurations__, that contain replace patterns in the following format:

```
eCommerce = Booking Service
Checkout = Book flight
```

This is the most simple format. The configurations are parsed as ini files, so you can use sections and comments for structure:

```
[Frontend]
; Change the main domain
shop.example.com = fly.example.org
; Localize cities
San Francisco = Berlin
New York = London
```

Additionally you have commands for complex replacements, variables and imports for improved reusability and options for changing the behavior of your demo monkey:

```
; Commands are introduced by '!'. For example you can use regular expressions:
!/Order/i = Flight

; Variables are introduced by '$', have a default value and a description
$domain = example.com//Set the name of your customer
api.payment.com = payment.$customer

; Imports are introduced by '+'. They allow you to load replacements from other configurations.
; For example you can externalize the replacements for cities and reuse it over and over again.
+GermanCities

; Options are introduced by '@'. You can use them to change the behavior of tampermonkey.
; A common use case is introducing include and exclude rules for domains:
@include =
@exclude =

```

## Installation

## Contribute

## License
This program is free software; see LICENSE for more details.

## Attribution
The monkey icon was made by Freepik from www.flaticon.com

## Contact ###
For any questions you can contact Severin Neumann <severin.neumann@altmuehlnet.de>
