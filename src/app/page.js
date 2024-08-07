'use client';
import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase/firebase';
import { doc, setDoc, addDoc, collection, getDocs, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

const Page = () => {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [idade, setIdade] = useState("");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const uploadImageAndSaveURL = async (file) => {
    try {
      setLoading(true);
      setError(false);

      const storageRef = ref(storage, `images/${uuidv4()}${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setImageUrl(downloadURL);
      await addDoc(collection(db, "images"), {
        imageUrl: downloadURL,
        createdAt: new Date(),
      });

      console.log('Image uploaded and URL saved in Firestore!');
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image and saving URL: ", error);
      setError('Error uploading image and saving URL.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (file) {
      return await uploadImageAndSaveURL(file);
    }
    return null;
  };

  const cadastrarPost = async (e) => {
    e.preventDefault();
    if(!nome.trim()){
      alert("coloque seu nome")
      return
    }


    if(!idade.trim()){
      alert("coloque a sua idade")
      return
    }

    try {
      const downloadURL = await handleUpload();
      const id = isEditing ? currentId : uuidv4();
      const docRef = doc(db, "posts", id);
      const data = {
        nome: nome,
        idade: idade,
        image: downloadURL ? downloadURL :"https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/cindra/imagens/sem.jpg.gif",
      };

      if (isEditing) {
        await updateDoc(docRef, data);
        setIsEditing(false);
      } else {
        await setDoc(docRef, data);
      }

      setIdade("");
      setNome("");
      setFile(null);
      setImageUrl("");
      console.log('Usuário criado com sucesso');
      fetchPosts(); // Atualiza os posts após criar ou editar um
    } catch (error) {
      console.error("Error ao criar: ", error);
    }
  };  

  const fetchPosts = async () => {
    try {
      const unsub= onSnapshot(collection(db, "posts"), (snapshot)=>{
        const listPost = []
        snapshot.forEach((doc)=>{
          listPost.push({
            id:doc.id,
            image:doc.data().image,
            nome:doc.data().nome,
            idade:doc.data().idade,
          })
          setPosts(listPost)
        })
      })
      
      
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      fetchPosts(); // Atualiza os posts após deletar um
      console.log('Usuário deletado com sucesso');
    } catch (error) {
      console.error("Erro ao deletar usuário: ", error);
    }
  };

  const editPost = (post) => {
    setNome(post.nome);
    setIdade(post.idade);
    if(file){
      setImageUrl(post.image);
    }
    setCurrentId(post.id);
    setIsEditing(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1>Estudando Firebase</h1>
      <form onSubmit={cadastrarPost} className='w-full mt-4 max-w-md shadow-md rounded-md p-4 bg-[#f4f6f8]'>
        <div className='flex'>
          <label htmlFor="image" className=' w-full max-w-[120px] mx-auto flex items-center justify-center'>
            <input type="file" id='image' onChange={handleFileChange} className='hidden' />
            <img src={imageUrl || "https://as1.ftcdn.net/v2/jpg/01/80/31/10/1000_F_180311099_Vlj8ufdHvec4onKSDLxxdrNiP6yX4PnP.jpg"} alt="Selected file" className='w-full h-auto max-w-[120px] rounded-full' />
          </label>
        </div>
        <div className='flex flex-col w-full mt-4'>
          <label htmlFor="nome">Nome</label>
          <input type="text" value={nome} onChange={({ target }) => setNome(target.value)} className='py-2 rounded-md pl-3 shadow-md' />
        </div>
        <div className='flex flex-col mt-4 w-full'>
          <label htmlFor="idade">Idade</label>
          <input type="text" value={idade} onChange={({ target }) => setIdade(target.value)} className='py-2 rounded-md pl-3 shadow-md' />
        </div>
        <button type="submit" className='mt-4 bg-violet-800 text-white px-8 py-2 rounded-md'>{isEditing ? 'Atualizar' : 'Enviar'}</button>
      </form>
      {loading && <p>Uploading...</p>}
      {error && <p>{error}</p>}
      <div className="mt-8">
        <h2>Usuários</h2>
        <div className="flex flex-col mx-w-3xl gap-4">
          {posts.map((post) => (
            <div key={post.id} className=" p-4 rounded-md border-b flex gap-4 items-center max-w-2xl justify-between">
              <div className="flex gap-4 b items-center">
                <img src={post.image} alt={post.nome} className="w-full h-auto mb-4 max-w-[100px] max-h-[100px] object-cover rounded-full" />
                <div>
                  <h3 className="text-xl font-bold">{post.nome}</h3>
                  <p>{post.idade} anos</p>
                  <Link href={`/posts/${post.id}`} className='text-blue-600'>ver perfil</Link>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editPost(post)} className="bg-blue-500 text-white px-4 py-2 rounded-md">Editar</button>
                <button onClick={() => deletePost(post.id)} className="bg-red-500 text-white px-4 py-2 rounded-md">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
