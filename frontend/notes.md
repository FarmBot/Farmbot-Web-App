# Encoder Scaling
|GCode|Param|Name|
|---|---|---|---|
|F15 |115|Enc. scaling|
|F16 |116|Enc. scaling|
|F17?|117|Enc. scaling|
|F05?|105|Enc. type|
|F06?|106|Enc. type|
|F07?|107|Enc. type|
|F22 (write 36)|Add to FarmBot JS|Enable X2|
|F22 (write 37)|Add to FarmBot JS|Invert X2|
|????|???|Set Home X|
|????|???|Set Home Y|
|????|???|Set Home Z|

# MCU Reset button

```
{
kind: "factory_reset"
args: {package: "arduino_firmware" || "farmbot_os"}
}
```
