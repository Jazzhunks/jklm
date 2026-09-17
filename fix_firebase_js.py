with open('frontend/src/lib/firebase.js', 'r') as f:
    js = f.read()

js = js.replace('"YOUR_PUBLIC_VAPID_KEY_HERE"', 'process.env.REACT_APP_VAPID_PUBLIC_KEY || ""')

with open('frontend/src/lib/firebase.js', 'w') as f:
    f.write(js)
