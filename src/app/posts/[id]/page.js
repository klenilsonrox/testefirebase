import { db } from '@/app/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import React from 'react';

const page =async ({params}) => {
    let nome
    let image
    let idade

    const postRef= doc(db, "posts", params.id)
    await getDoc(postRef).then((snapshot)=>{
        nome = snapshot.data().nome
       idade = snapshot.data().idade
        image = snapshot.data().image
    }).catch((error)=>{
        console.log(error)
    })


  return (
    <div className="max-w-md border rounded-md mx-auto overflow-hidden">
      <img src={image} alt="" className='rounded-lg '/>
      <div className='p-4'>
      <h1>{nome}</h1>
      <p>{idade} anos</p>
      <Link href="/">Voltar</Link>
      </div>
    </div>
  );
};

export default page;