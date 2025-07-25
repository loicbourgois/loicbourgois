

// test_usb()

const test_usb = async () => {
    const aa = navigator.usb.getDevices()
    console.log(aa)
    const bb = await aa
    console.log(bb)
    // navigator.usb.getDevices().then((devices) => {
    //   devices.forEach((device) => {
    //     console.log(device.productName); // "Arduino Micro"
    //     console.log(device.manufacturerName); // "Arduino LLC"
    //   });
    // });
}