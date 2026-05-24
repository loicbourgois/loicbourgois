const create_shader_module = async ({
    device,
    source,
    imports,
    formatting,
}) => {
    let code = await (await fetch(source, {cache: "no-store"})).text()
    for (const import_ of imports) {
        const import_code = await (await fetch(import_, {cache: "no-store"})).text()
        code = code.replaceAll(`// import file://${import_}`, import_code)
    }
    for (const k in formatting) {
        const v = formatting[k]
        code = code.replaceAll(k, v)
    }
    return device.createShaderModule({
        code:code,
    })
}


export {
    create_shader_module
}
