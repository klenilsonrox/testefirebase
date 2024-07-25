import { initializeApp } from "firebase/app"
import { getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyBjqrXivj8KpPv6YtGA94q-C2qrnw81CPc",
    authDomain: "projeto-blog-c66e5.firebaseapp.com",
    projectId: "projeto-blog-c66e5",
    storageBucket: "projeto-blog-c66e5.appspot.com",
    messagingSenderId: "444758027605",
    appId: "1:444758027605:web:ae7e4d7ac32d780ce6d3dc"
  })

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp);

export {db,storage}




