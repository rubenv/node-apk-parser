parseApk = (filename, cb) ->
    # TODO: Pipe APK to aapt
    parseOutput(text, cb)

extractRaw = (string) ->
    sep = '" (Raw: "'
    parts = string.split(sep)
    value = parts[0...(parts.length/2)].join(sep)
    return value.substring(1)

parseOutput = (text, cb) ->
    return cb(new Error('No input!')) if !text
    lines = text.split '\n'

    result = {}
    stack = [result]

    inManifest = false
    for line in lines
        # Skip until we find the manifest
        if line.trim() == 'Android manifest:'
            inManifest = true
            continue
        continue if !inManifest

        # Skip whitespace
        continue if line.trim() == ''

        # Ignore namespaces
        continue if line.match /^N:/

        # Match the first part of the line
        matches = line.match /^( +)(A|E): ([\w:\-]+)(.*)$/
        if !matches
            return cb(new Error('Parse failure: ' + line))

        [input, indent, type, name, rest] = matches
        depth = indent.length / 2
        parent = stack[depth-1]

        if type == 'E'
            element = {
                '@name': name
            }

            # Fix stack
            stack.pop() while stack.length > depth
            if depth == stack.length
                stack.push element

            if !parent[name]
                parent[name] = []
            parent[name].push element

        else if type == 'A'
            value = null

            if rest.substring(0, 2) == '="'
                # Embedded string
                value = extractRaw(rest.substring(1))
            else
                parts = rest.match /^\(0x[0-9a-f]+\)\=(.*)$/
                return cb(new Error('Cannot parse value: ' + rest)) if !parts

                if parts[1][0] == '"'
                    # Linked string
                    value = extractRaw(parts[1])
                else
                    # No idea, get the raw hex value
                    value = parts[1]

            parent['@' + name] = value
                
        else
            return cb(new Error('Unknown type: ' + type))

    cb(null, result)

parseApk.parseOutput = parseOutput

module.exports = parseApk
