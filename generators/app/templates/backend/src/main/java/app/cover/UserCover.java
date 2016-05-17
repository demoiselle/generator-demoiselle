/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.cover;

import app.entity.User;

/**
 *
 * @author gladson
 */
public class UserCover {

    private Long id;
    private String nome;
    private String perfil;
    private String ip;

    /**
     *
     * @param user
     */
    public UserCover(User user) {
        this.id = user.getId();
        this.nome = user.getName();
        this.perfil = user.getPerfil();
        this.ip = user.getIp();
    }

    /**
     *
     * @return
     */
    public Long getId() {
        return id;
    }

    /**
     *
     * @param id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     *
     * @return
     */
    public String getNome() {
        return nome;
    }

    /**
     *
     * @param nome
     */
    public void setNome(String nome) {
        this.nome = nome;
    }

    /**
     *
     * @return
     */
    public String getPerfil() {
        return perfil;
    }

    /**
     *
     * @param perfil
     */
    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

}
