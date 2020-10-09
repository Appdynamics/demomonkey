# DemoMonkey
Tamper your application's UI to demo anything

## Introduction
Giving custom demos in the verticals of your prospects, shows them that you understand their specific requirements and that you did our homework. Although building meaningful demos is a time-consuming task, so not every demo is setup in the environment of our customers. DemoMonkey gives you a simple way of building custom demos for HTML5 based application. By providing text replacements you can go within minutes from an e-commerce demo application to a customer care center or flight booking service.

## Usage
DemoMonkey is driven by __configurations__, that contain replace patterns in the following format:

```ini
eCommerce = Booking Service
Checkout = Book flight
```

This is the most simple format. The configurations are parsed as ini files, so you can use sections and comments for structure:

```ini
[Frontend]
; Change the main domain
shop.example.com = fly.example.org
; cities
San Francisco = Berlin
New York = London
```

Additionally you have commands for complex replacements, variables and imports for improved reusability and options for changing the behavior of your demo monkey:

```ini
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

See [USAGE.md](Usage.md) for a more comprehensive guide.

## Installation
To add the latest version as extension to chrome, use the following link:

https://chrome.google.com/webstore/detail/demomonkey/jgbhioialphpgjgofopnplfibkeehgjd

To use a pre-release version, you can also switch to the developer channel:

https://chrome.google.com/webstore/detail/demomonkey-dev-channel/dgmdcddamkccpmefapgabnafjhhcdhdh

## Contribute
If you want to contribute to the development of DemoMonkey, you can help by reporting issues, fixing bug or developing new features.

If you'd like to contribute code, read [CONTRIBUTE.md](CONTRIBUTE.md).

## License

Copyright 2017 AppDynamics LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

## Attribution
The Demo Monkey icon was created by Lora Tomova

## Contact ###
For any questions you can contact [Severin Neumann](https://github.com/svrnm)
