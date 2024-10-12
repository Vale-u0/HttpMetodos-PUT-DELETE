import { Component, OnInit } from '@angular/core';
import { Usuario } from './models/Usuarios.interface';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  usuarios: Usuario[] = [];
  nuevoUsuario: Usuario = { nombre: '', email: '', empresa: '' }; // Modelo para el nuevo usuario
  editando: boolean = false; // Variable para saber si estamos en modo de edición
  usuarioIdParaEditar?: number; // Almacena el ID del usuario que se está editando
  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  // Método para obtener los usuarios
  obtenerUsuarios() {
    this.http.get<any[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe(data => {
        this.usuarios = data.map(user => ({
          id: user.id,
          nombre: user.name,
          email: user.email,
          empresa: user.company.name
        }));
      });
  }

  // Método para agregar un nuevo usuario con POST
  agregarUsuario() {
    const { nombre, email, empresa } = this.nuevoUsuario;
    
    // Validaciones
    if (!nombre) {
      Swal.fire('Error', 'El campo nombre es obligatorio', 'error');
      return;
    }
    
    if (!email) {
      Swal.fire('Error', 'El campo email es obligatorio', 'error');
      return;
    }
    
    if (!empresa) {
      Swal.fire('Error', 'El campo empresa es obligatorio', 'error');
      return;
    }
    
    const body = {
      name: nombre,
      email: email,
      company: {
        name: empresa
      }
    };
    
    Swal.fire({
      title: 'Agregar usuario',
      text: `¿Estás seguro de agregar al usuario ${nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.http.post('https://jsonplaceholder.typicode.com/users', body)
          .subscribe(response => {
            console.log('Usuario agregado:', response);
            // Simulamos que el usuario ha sido agregado a la lista (aunque no se guarda realmente)
            this.usuarios.push(this.nuevoUsuario); // Actualizamos la lista localmente
            this.nuevoUsuario = { nombre: '', email: '', empresa: '' }; // Limpiamos el formulario
          });
      }
    });
  }

   // Método para cargar los datos del usuario seleccionado en el formulario
   editarUsuario(usuario: Usuario) {
    this.nuevoUsuario = { ...usuario };
    this.editando = true;
    this.usuarioIdParaEditar = usuario.id; // Guardamos el id del usuario que estamos editando
  }

// Método para limpiar el formulario y resetear el modo edición
limpiarFormulario() {
  this.nuevoUsuario = { nombre: '', email: '', empresa: '' }; // Limpia los campos del usuario
  this.editando = false; // Sale del modo edición
  this.usuarioIdParaEditar = undefined; // Resetea el ID del usuario en edición
}

  // Método para actualizar los datos del usuario con ventana emergente de confirmación
  actualizarUsuario() {
    // Muestra la ventana de confirmación antes de actualizar
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Estás a punto de actualizar los datos del usuario.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const body = {
          name: this.nuevoUsuario.nombre,
          email: this.nuevoUsuario.email,
          company: {
            name: this.nuevoUsuario.empresa
          }
        };

        this.http.put(`https://jsonplaceholder.typicode.com/users/${this.usuarioIdParaEditar}`, body)
          .subscribe(response => {
            console.log('Usuario actualizado:', response);
            // Actualizamos la lista local de usuarios
            this.usuarios = this.usuarios.map(u => u.id === this.usuarioIdParaEditar ? { ...this.nuevoUsuario, id: this.usuarioIdParaEditar } : u);
            this.limpiarFormulario();

            // Mostramos una alerta de éxito después de la actualización
            Swal.fire(
              'Actualizado',
              'El usuario ha sido actualizado exitosamente.',
              'success'
            );
          });
      }
    });
  }




  // Método para eliminar usuario DELETE
  eliminarUsuario(usuario: Usuario) {
    const id = usuario.nombre; // En este caso, usamos el nombre como identificador
    // En un escenario real, deberías usar el ID real del usuario
  
    Swal.fire({
      title: 'Eliminar usuario',
      text: `¿Estás seguro de eliminar al usuario ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.http.delete(`https://jsonplaceholder.typicode.com/users/${id}`)
          .subscribe(response => {
            console.log('Usuario eliminado:', response);
            // Simulamos que el usuario ha sido eliminado de la lista (aunque no se elimina realmente)
            this.usuarios = this.usuarios.filter(u => u.nombre !== usuario.nombre);
          });
      }
    });
  }
}
