/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.constants;

/**
 *
 * @author 70744416353
 */
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

}
