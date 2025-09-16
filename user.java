public class user {
    private String rut;
    private String nombre;
    private int numero;
    private String correo;
    
    public user(){
        this.rut="12.345.678-9";
        this.nombre="John banks";
        this.numero=123456789;
        this.correo="mymail@gmail.com";
    }
    public user(String rut, String nombre, int numero, String correo){
        this.rut=rut;
        this.nombre=nombre;
        this.numero=numero;
        this.correo=correo;
    }
    ////getters
    String getrut(){
        return rut;
    }
    String getnombre(){
        return nombre;
    }
    int getnumero(){
        return numero;
    }
    String getcorreo(){
        return correo;
    }
    /////Setters
    void setrut(String rut){
        this.rut=rut;
    }
    void setnombre(String nombre){
        this.nombre=nombre;
    }
    void setnumero(int numero){
        this.numero=numero;
    }
    void setcorreo(String correo){
        this.correo=correo;
    }

}
