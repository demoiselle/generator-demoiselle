package <%= package.lower %>.<%= project.lower %>.constants;

import java.util.HashMap;
import java.util.Map;

public enum Perfil {
    
    ADMINISTRADOR("Administrador"),
    GERENTE("Gerente"),
    USUARIO("Usuário");

    private final String value;

    private Perfil(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
    
    @Override
    public String toString() {
        return this.value;
    }

    public static Map getMap() {
        Map<app.constants.Perfil, String> map = new HashMap<>();
        for (app.constants.Perfil userType : app.constants.Perfil.values()) {
            map.put(userType, userType.toString());
        }
        return map;
    }

}
