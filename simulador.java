public class simulador {
      private int monto;
      private int cuotas;
      private int mespago;
      private int diapago;
      private boolean seguro;

      private double interesmensual;
      private double factorinteres;
      private double total;
      private double valorcuota;

      public simulador(int monto,int cuotas, int mespago,int diapago, boolean seguro){
        this.factorinteres=0.05;
        this.monto=monto;
        this.cuotas=cuotas;
        this.mespago=mespago;
        this.diapago=diapago;
        this.seguro=seguro;
      }
      /////Getters
      public int getmonto(){
        return monto;
      }
      public int getcuotas(){
        return cuotas;
      }
      public int getmespago(){
        return mespago;
      }
      public int getdiapago(){
        return diapago;
      }
      public boolean getseguro(){
        return seguro;
      }

      public double getinteresmensual(){
        return interesmensual;
      }
      public double getfactorinteres(){
        return factorinteres;
      }
      public double gettotal(){
        return total;
      }
      public double getvalorcuota(){
        return valorcuota;
      }
      /////Setters
      public void setmonto(int monto){
        this.monto=monto;
      }
      public void setcuotas(int cuotas){
        this.cuotas=cuotas;
      }
      public void setmespago(int mespago){
        if (mespago>12||mespago<1){
            throw new IllegalArgumentException("del 1-12");
        }else{
        this.mespago=mespago;}
      }
      public void setdiapago(int diapago){
        if (this.mespago==1||this.mespago==3||this.mespago==5||this.mespago==7||this.mespago==8||this.mespago==10||this.mespago==12){
            if(diapago>31||diapago<1){
                throw new IllegalArgumentException("Este mes tiene 31 dias");
            }
        else if(this.mespago==2){
            if(diapago>29||diapago<1){
                throw new IllegalArgumentException("Este mes tiene 29 dias");
            }
        }else if(diapago>30||diapago<1){
            throw new IllegalArgumentException("Este mes tiene 30 dias");
            }
        }
        else{
        this.diapago=diapago;}
      }
      public void setseguro(boolean seguro){
        this.seguro=seguro;
      }
      /////
      public void simular(){       
        this.interesmensual=this.factorinteres*this.cuotas;
        this.valorcuota=(monto/cuotas)+(monto*interesmensual);
        this.total=(valorcuota*cuotas);
      }
      public void simular(int monto,int cuotas, int mespago,int diapago, boolean seguro){
        this.factorinteres=0.05;
        this.monto=monto;
        this.cuotas=cuotas;
        this.mespago=mespago;
        this.diapago=diapago;
        this.seguro=seguro;

        this.interesmensual=this.factorinteres*this.cuotas;
        this.valorcuota=(monto/cuotas)+(monto*interesmensual);
        this.total=(valorcuota*cuotas);

        }
    }
