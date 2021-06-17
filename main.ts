/**
* STEM Power Four Digits Display Module (TM1637) microbit extension.
* https://stem-power.com
*/

/**
 * Four Digits 7-Segments Display Module
 */
//% weight=100 color=#809536 icon="\uf017"  block="TM1637 V5"
namespace TM1637 {
    let TM1637_CMD1 = 0x40
    let TM1637_CMD2 = 0xC0
    let TM1637_CMD3 = 0x80
    let DM_SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71]
    let DMcount= 4  // number of LEDs
    let DMbuf= pins.createBuffer(DMcount);
    let DMclk: DigitalPin
    let DMdio: DigitalPin
    let DM_ON: number
    let DMbrightness: number

    /**
    * (internal function) start
    */
    function DM_start() {
            pins.digitalWritePin(DMclk, 1);
            pins.digitalWritePin(DMdio, 1);
            pins.digitalWritePin(DMdio, 0);
            pins.digitalWritePin(DMclk, 0);
    }

    /**
    * (internal function) stop
    */
    function DM_stop() {
            pins.digitalWritePin(DMclk, 0);
            pins.digitalWritePin(DMdio, 0);
            pins.digitalWritePin(DMclk, 1);
            pins.digitalWritePin(DMdio, 1);
    }

    /**
    * (internal function) send command 1
    */
    function DM_write_data_cmd() {
            DM_start();
            DM_write_byte(TM1637_CMD1);
            DM_stop();
    }

    /**
    * (internal function) send command 3
    */
    function DM_write_dsp_ctrl() {
            DM_start();
            DM_write_byte(TM1637_CMD3 | DM_ON | DMbrightness);
            DM_stop();
    }

    /**
    * (internal function) send a byte to 2 wire interface
    */
    function DM_write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(DMclk, 0);
                pins.digitalWritePin(DMdio, (b >> i) & 1);
                pins.digitalWritePin(DMclk, 1);
                
            }
            pins.digitalWritePin(DMclk, 0);
            pins.digitalWritePin(DMdio, 1);
            pins.digitalWritePin(DMclk, 1);
    }

    /**
    * (internal function) set data to TM1637, with given bit
    */
    function  DM_dat(DMbit: number, DMdat: number) {
            DM_write_data_cmd();
            DM_start();
            DM_write_byte(TM1637_CMD2 | (DMbit % DMcount))
            DM_write_byte(DMdat);
            DM_stop();
            DM_write_dsp_ctrl();
    }

    /**
    * (internal function) set colon status
    */
    function DM_dat2(DMdat: number) {
            DM_write_data_cmd();
            DM_start();
            DM_write_byte(TM1637_CMD2 | (4))
            DM_write_byte(DMdat);
            DM_stop();
            DM_write_dsp_ctrl();
    }

    /**
    * (internal function) set apostrophe to TM1637
    */
       function DM_dat3(DMdat: number) {
            DM_write_data_cmd();
            DM_start();
            DM_write_byte(TM1637_CMD2 | (5))
            DM_write_byte(DMdat);
            DM_stop();
            DM_write_dsp_ctrl();
    }

    /**
     * TM1637 Setup
     * @param TM1637clk the CLK pin for TM1637, eg: DigitalPin.P16
     * @param TM1637dio the DIO pin for TM1637, eg: DigitalPin.P15
     * @param DMintensity the brightness of the LED, eg: 7
     * @param DigitCount the count of the 7-segments, eg: 4
     */
    //% blockId="TM1637_init" block="TM1637 CLK %TM1637clk|DIO %DTM1637dio|intensity %DMintensity|7-segments count %DMcount"
    //% weight=99 blockGap=8
    //% DMintenstity.min=0 DMintensity.max=8
    //% DMcount.min=1 DMcount.max=4
    //% parts="TM1637"
    export function TM1637_init(TM1637clk: DigitalPin, TM1637dio: DigitalPin, DMintensity: number, DigitCount: number): void {
            DMclk = TM1637clk
            DMdio = TM1637dio
            DMcount = DigitCount
            pins.digitalWritePin(DMclk, 0);
            pins.digitalWritePin(DMdio, 0);
            DMbrightness = DMintensity;
            DM_ON = 8;
            DMbuf = pins.createBuffer(DMcount);
            DMclear();

    }

    /**
    * show a number. 
    * @param DMnum is a number, eg: 0
    */
    //% blockId="DMshowNumber" block="show number %DMnum"
    //% weight=98 blockGap=8
    //% parts="TM1637"
    export function DMshowNumber(DMnum: number) {
        if (DMnum < 0) {
            DM_dat(0, 0x40) // '-'
            DMnum = -DMnum
            DMshowbit(DMnum % 10, 4)
            DMshowbit((DMnum / 10) % 10, 3)
            DMshowbit((DMnum / 100) % 10, 2)
        }
        else {
            DMshowbit((DMnum / 1000) % 10, 1)
            DMshowbit(DMnum % 10, 4)
            DMshowbit((DMnum / 10) % 10, 3)
            DMshowbit((DMnum / 100) % 10, 2)
        }
        
    }    

    /**
    * show a number in given position. 
    * @param DMnum number will show, eg: 5
    * @param DMposition the position of the number, eg: 1
    */
    //% blockId="DMshowbit" block="show digit %DMnum |at %DMposition"
    //% weight=97 blockGap=8
    //% DMposition.min=1 DMposition.max=4
    //% parts="TM1637"
    export function DMshowbit(DMnum: number = 5, DMposition: number = 1) {
        DMposition -= 1
        DMbuf[DMposition % DMcount] = DM_SEGMENTS[DMnum % 16]
        DM_dat(DMposition, DM_SEGMENTS[DMnum % 16])
    }

    /**
    * show a hex number. 
    * @param DMnum is a hex number, eg: 0
    */
    //% blockId="DMshowhex" block="show hex number %DMnum"
    //% weight=96 blockGap=8
    //% parts="TM1637"
    export function DMshowHex(DMnum: number) {
        if (DMnum < 0) {
        DM_dat(0, 0x40) // '-'
            DMnum = -DMnum
        }
        else {
            DMshowbit((DMnum >> 12) % 16, 1)
            DMshowbit(DMnum % 16, 4)
            DMshowbit((DMnum >> 4) % 16, 3)
            DMshowbit((DMnum >> 8) % 16, 2)
        }
    }

    /**
    * show or hide dot point. 
    * @param DMposition is the dot point position, eg: 1
    * @param DMDPshow is show/hide dot point, eg: true
    */
    //% blockId="DMshowDP" block="show dot point at %DMposition | %DMDPshow"
    //% weight=95 blockGap=8
    //% DMposition.min=1 DMposition.max=4
    //% parts="TM1637"
    export function DMshowDP(DMposition: number = 1, DMDPshow: boolean = true) {
        DMposition -= 1
        DMposition = DMposition % DMcount
        if (DMDPshow) DM_dat(DMposition, DMbuf[DMposition] | 0x80)
        else DM_dat(DMposition, DMbuf[DMposition] & 0x7F)
    }

    /**
    * show or hide colon
    * @param DMCshow is show/hide colon, eg: true
    */
    //% blockId="DMshowColon" block="show colon %DMCshow"
    //% weight=94 blockGap=8
    //% parts="TM1637"
    export function DMshowColon(DMCshow: boolean = true) {
        if (DMCshow) DM_dat2(DMbuf[4] | 0x80)
        else DM_dat2(DMbuf[4] & 0x7F)
    }

    /**
    * show or hide apostrophe. 
    * @param DMAshow is show/hide apostrophe, eg: true
    */
    //% blockId="DMshowApostrophe" block="show apostrophe %DMAshow"
    //% weight=93 blockGap=8
    //% parts="TM1637"
    export function DMshowApostrophe(DMAshow: boolean = true) {
        if (DMAshow) DM_dat3(DMbuf[5] | 0x80)
        else DM_dat3(DMbuf[5] & 0x7F)
    }

    /**
     * set TM1637 intensity, range is [0-8], 0 is off.
      * @param val the brightness of the TM1637, eg: 7
     */
    //% blockId="DM_intensity" block="set intensity %DMval"
    //% weight=89 blockGap=8
    //% DMval.min=0 DMval.max=8
    //% parts="TM1637"
    export function DM_intensity(DMval: number = 7) {
        if (DMval < 1) {
            DM_off()
            return
        }
        DMbrightness = DMval - 1
        DM_write_data_cmd()
        DM_write_dsp_ctrl()
    }

    /**
    * clear display. 
    */
    //% blockId="DMclear" block="clear display"
    //% weight=88 blockGap=8
    //% parts="TM1637"
    export function DMclear() {
        for (let i = 0; i < DMcount; i++) {
            DM_dat(i, 0)
            DMbuf[i] = 0
        }
        DM_dat2(0)
        DM_dat3(0)
    }

    /**
    * turn on display. 
    */
    //% blockId="DM_on" block="turn on display"
    //% weight=87 blockGap=8
    //% parts="TM1637"
    export function DM_on() {
        DM_ON = 8;
        DM_write_data_cmd();
        DM_write_dsp_ctrl();
    }

    /**
    * turn off display. 
    */
    //% blockId="DM_off" block="turn off display"
    //% weight=86 blockGap=8
    //% parts="TM1637"
    export function DM_off() {
            DM_ON = 0;
            DM_write_data_cmd();
            DM_write_dsp_ctrl();
    }
}
