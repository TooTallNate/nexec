# nexec

Execute a command remotely over HTTPS.

## Example

```bash
#!/bin/sh
eval "`curl -sfLS import.pw`"

import tootallnate/nexec@1.1.0

nexec bash --version
```

```
GNU bash, version 4.3.48(1)-release (x86_64-alpine-linux-musl)
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```
