/**
 * PGXP
 * Copyright (C) 2012 Paulo Gladson Ximenes Pinheiro <paulo.pinheiro@serpro.gov.br>
 * and other contributors as indicated by the Paulo Gladson Ximenes Pinheiro.
 *
 *
 */
/*
 * Criado em 26/10/2004
 */
package app.util;

import java.io.FileWriter;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Classe com fun��es para manipula��o de Data e hora.<br>
 *
 * @author felipev
 * @since 26/10/2004
 * @version N/C
 */
public abstract class Conversor {

    /**
     *
     * @param totalMemoria
     * @return
     */
    public static String visualizaMemoria(double totalMemoria) {
        if ((((totalMemoria / 1024) / 1024) / 1024) > 1) {
            return arredondar((((totalMemoria / 1024) / 1024) / 1024), 2, 0) + " Gb";
        } else if (((totalMemoria / 1024) / 1024) > 1) {
            return arredondar(((totalMemoria / 1024) / 1024), 2, 0) + " Mb";
        } else if ((totalMemoria / 1024) > 1) {
            return arredondar(((totalMemoria / 1024)), 2, 0) + " Kb";
        } else {
            return arredondar((totalMemoria), 2, 0) + " bytes";
        }
    }

    /**
     * 1 - Valor a arredondar. 2 - Quantidade de casas depois da vírgula. 3 - Arredondar para cima ou para baixo? Para cima = 0 (ceil) Para baixo = 1 ou qualquer outro inteiro
     * (floor)
     *
     * @param valor
     * @param casas
     * @param ceilOrFloor
     * @return
     */
    public static double arredondar(double valor, int casas, int ceilOrFloor) {
        double arredondado = valor;
        arredondado *= (Math.pow(10, casas));

        if (ceilOrFloor == 0) {
            arredondado = Math.ceil(arredondado);
        } else {
            arredondado = Math.floor(arredondado);
        }

        arredondado /= (Math.pow(10, casas));

        return arredondado;
    }

    /**
     *
     * @param time
     * @return
     */
    public static String elapsedTime(long time) {
        final long FATOR_SEGUNDO = 1000;
        final long FATOR_MINUTO = FATOR_SEGUNDO * 60;
        final long FATOR_HORA = FATOR_MINUTO * 60;

        // long tempo = elapsedTime();
        long horas;

        // long tempo = elapsedTime();
        long minutos;

        // long tempo = elapsedTime();
        long segundos;

        // long tempo = elapsedTime();
        long milesimos;
        horas = time / FATOR_HORA;
        minutos = (time % FATOR_HORA) / FATOR_MINUTO;
        segundos = (time % FATOR_MINUTO) / FATOR_SEGUNDO;
        milesimos = time % FATOR_SEGUNDO;

        return " " + horas + " hours, " + minutos + " minutes, " + segundos + " seconds and " + milesimos +
               " miliseconds";
    }

    /**
     *
     * @param nomeArquivo
     * @param texto
     */
    public static void gerarArquivo(String nomeArquivo, List<String> texto) {
        try {
            FileWriter x = new FileWriter(nomeArquivo, true);

            for (String linha : texto) {
                x.write(linha + "\n");
            }

            x.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     *
     * @param hql
     */
    public static void testConsultaComCache(String hql) {
//        long numberOfMessages = jdbcTemplate.queryForInt(hql);
//        System.out.println("Number of rows :" + numberOfMessages);
//        final String cacheRegion = Message.class.getCanonicalName();
//        SecondLevelCacheStatistics settingsStatistics = sessionFactory.getStatistics().
//            getSecondLevelCacheStatistics(cacheRegion);
//        StopWatch stopWatch = new StopWatch();
//        for (int i = 0; i < 10; i++)
//        {
//            stopWatch.start();
//            messageDAO.findAllMessages();
//            stopWatch.stop();
//            System.out.println("Query time : " + stopWatch.getTime());
//            assertEquals(0, settingsStatistics.getMissCount());
//            assertEquals(numberOfMessages * i, settingsStatistics.getHitCount());
//            stopWatch.reset();
//            System.out.println(settingsStatistics);
//            endTransaction();
//
//            // spring creates a transaction when test starts - so we first end it then start a new in the loop
//            startNewTransaction();
//        }
    }

    /**
     *
     * @param hql
     */
    public static void testConsultaSemCache(String hql) {
//        long numberOfMessages = jdbcTemplate.queryForInt(hql);
//        System.out.println("Number of rows :" + numberOfMessages);
//        final String cacheRegion = Message.class.getCanonicalName();
//        SecondLevelCacheStatistics settingsStatistics = sessionFactory.getStatistics().
//            getSecondLevelCacheStatistics(cacheRegion);
//        StopWatch stopWatch = new StopWatch();
//        for (int i = 0; i < 10; i++)
//        {
//            stopWatch.start();
//            messageDAO.findAllMessages();
//            stopWatch.stop();
//            System.out.println("Query time : " + stopWatch.getTime());
//            assertEquals(0, settingsStatistics.getMissCount());
//            assertEquals(numberOfMessages * i, settingsStatistics.getHitCount());
//            stopWatch.reset();
//            System.out.println(settingsStatistics);
//            endTransaction();
//
//            // spring creates a transaction when test starts - so we first end it then start a new in the loop
//            startNewTransaction();
//        }
    }

    /**
     * Converte um Date para uma String no formato dd/mm/aaaa.<br>
     *
     * @param data
     * @author N/C
     * @since N/C
     * @version N/C
     * @return String
     */
    public static String parseDate(Date data) {
        final String formato = "dd/MM/yyyy";
        String strRetorno = null;
        final SimpleDateFormat formatter = new SimpleDateFormat(formato);

        if ((data != null)) {
            strRetorno = formatter.format(data);
        } else {
            strRetorno = "";
        }

        return strRetorno;
    }

    /**
     * Converte um Long para um Date.<br>
     *
     * @param data
     * @author N/C
     * @since N/C
     * @version N/C
     * @return java.Util.Date
     */
    public static Date parseDate(long data) {
        return new Date(data);
    }

    /**
     * Converte uma String para um Date.<br>
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @return java.Util.Date
     */
    public static Date parseDate(String data) {
        if (data.length() == 10) {
            return parseDate(data, "dd/MM/yyyy");
        }

        if (data.indexOf("/") == 1) {
            data = "0" + data;
        }

        if (data.indexOf("/", 3) == 4) {
            final String aux = data;
            data = aux.substring(0, 3) + "0" + aux.substring(3);
        }

        if (data.length() == 8) {
            final String aux = data;
            data = aux.substring(0, 6) + "20" + aux.substring(6);
        }

        return parseDate(data, "dd/MM/yyyy");
    }

    /**
     * Converte uma String para um Date, seguindo um formato espec�fico.<br> Ex.: String data = "14021982"<br> String formato = "ddMMyyyy"<br> Retorna um objeto Date, com dia = 14,
     * m�s = 02, ano = 1982<br>
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @param formato
     * @return java.Util.Date
     */
    public static Date parseDate(String data, String formato) {
        java.util.Date date = null;

        try {
            final DateFormat formatter = new SimpleDateFormat(formato);
            date = formatter.parse(data);
        } catch (final ParseException e) {
            return null;
        }

        return date;
    }

    /**
     * Converte um Date para uma String no formato dd/mm/aaaa HH:mm:ss.<br>
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @return String
     */
    public static String parseDateHour(Date data) {
        final String formato = "dd/MM/yyyy HH:mm:ss:SSS";
        String strRetorno = null;
        final SimpleDateFormat formatter = new SimpleDateFormat(formato);

        if ((data != null)) {
            strRetorno = formatter.format(data);
        } else {
            strRetorno = "";
        }

        return strRetorno;
    }

    /**
     * Converte um String para um Date no formato dd/mm/aaaa HH:mm:ss.<br>
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @return Date
     */
    public static Date parseDateHour(String data) {
        java.util.Date date = null;

        try {
            final DateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss:SSS");
            date = formatter.parse(data);
        } catch (final ParseException e) {
            return null;
        }

        return date;
    }

    /**
     * Converte um Date para uma String no formato dd/mm/aaaa HH:mm:ss.<br>
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @return String
     */
    public static String parseDateHourMinuteSecond(Date data) {
        final String formato = "dd/MM/yyyy HH:mm:ss";
        String strRetorno = null;
        final SimpleDateFormat formatter = new SimpleDateFormat(formato);

        if ((data != null)) {
            strRetorno = formatter.format(data);
        } else {
            strRetorno = "";
        }

        return strRetorno;
    }

    /**
     * Converte um Date para uma string no formato mm.ss.SSS
     *
     * @author N/C
     * @since N/C
     * @version N/C
     * @param data
     * @return String
     */
    public static String parseDateHourSegundos(Date data) {
        final String formato = "mm.ss.SSS";
        String strRetorno = null;
        final SimpleDateFormat formatter = new SimpleDateFormat(formato);

        if ((data != null)) {
            strRetorno = formatter.format(data);
        } else {
            strRetorno = "";
        }

        return strRetorno;
    }

    /**
     * Converte um String para um Date no formato dd/mm/aaaa HH:mm:ss.<br>
     *
     * @param data
     * @author N/C
     * @since N/C
     * @version N/C
     * @return Date
     */
    public static Timestamp parseDateHourTimeStamp(String data) {
        Timestamp date = null;

        try {
            final DateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss:SSS");
            date = new Timestamp(formatter.parse(data).getTime());
        } catch (final ParseException e) {
            return null;
        }

        return date;
    }

    /**
     *
     * @return
     */
    public static short getAno() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.YEAR));
    }

    /**
     *
     * @return
     */
    public static short getMes() {
        return Short.parseShort("" + (Calendar.getInstance().get(Calendar.MONTH) + 1));
    }

    /**
     *
     * @return
     */
    public static short getDia() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.DAY_OF_MONTH));
    }

    /**
     *
     * @return
     */
    public static short getHora() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.HOUR));
    }

    /**
     *
     * @return
     */
    public static short getMinuto() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.MINUTE));
    }

    /**
     *
     * @return
     */
    public static short getDiaDaSemana() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.DAY_OF_WEEK));
    }

    /**
     *
     * @return
     */
    public static short getDiaNoAno() {
        return Short.parseShort("" + Calendar.getInstance().get(Calendar.DAY_OF_YEAR));
    }

    /**
     *
     * @return
     */
    public static short getDiaOntem() {
        Calendar cal = Calendar.getInstance();
        int dia = cal.get(Calendar.DAY_OF_MONTH);
        if (dia == 1) {
            cal.set(Calendar.DAY_OF_MONTH, -1);
            dia = cal.get(Calendar.DAY_OF_MONTH);
        }
        return Short.parseShort("" + (dia - 1));
    }

    /**
     *
     * @return
     */
    public static short getMesOntem() {
        Calendar cal = Calendar.getInstance();
        int dia = cal.get(Calendar.DAY_OF_MONTH);
        int mes = cal.get(Calendar.MONTH);
        if (dia == 1) {
            cal.set(Calendar.MONTH, -1);
            mes = cal.get(Calendar.MONTH);
        }
        return Short.parseShort("" + (mes + 1));
    }

    /**
     *
     * @return
     */
    public static short getAnoOntem() {
        Calendar cal = Calendar.getInstance();
        int dia = cal.get(Calendar.DAY_OF_MONTH);
        int mes = cal.get(Calendar.MONTH);
        int ano = cal.get(Calendar.YEAR);
        if (dia == 1 && mes == 0) {
            cal.set(Calendar.YEAR, -1);
            ano = cal.get(Calendar.YEAR);
        }
        return Short.parseShort("" + ano);
    }
}
