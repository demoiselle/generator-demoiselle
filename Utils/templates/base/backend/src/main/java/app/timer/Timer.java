package <%= package.lower %>.<%= project.lower %>.timer;

import java.util.List;
import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.ejb.Schedule;
import javax.ejb.Stateless;
import javax.transaction.Transactional;
import javax.inject.Inject;
import <%= package.lower %>.<%= project.lower %>.cloud.CloudSender;
import <%= package.lower %>.<%= project.lower %>.dao.FingerprintDAO;
import <%= package.lower %>.<%= project.lower %>.entity.Fingerprint;

/**
 *
 * @author SERPRO
 */
@Stateless
public class Timer {

    private static final Logger LOG = getLogger(Timer.class.getName());

    @Inject
    private FingerprintDAO fingerprintDAO;

    @Inject
    private CloudSender sender;

    /**
     *
     */
    @Transactional
    @Schedule(second = "0", minute = "0", hour = "*/1", persistent = false)
    public void atSchedule1h() {
        List<Fingerprint> fps = (List<Fingerprint>) fingerprintDAO.find().getContent();

         fps.stream().filter((fp) -> (fp.getCodigo().contains("send"))).map((fp) -> {
             sender.send(fp.getCodigo().split("send/")[1], "Sistema atualizado");
             return fp;
         }).forEachOrdered((fp) -> {
             fingerprintDAO.remove(fp.getId());
             LOG.info(fp.getUsuario() + " apagado ");
         });
    }

    /**
     *
     */
    @Transactional
    @Schedule(second = "0", minute = "*/1", hour = "*", persistent = false)
    public void atSchedule1m() {
        //LOG.info("atSchedule1m");
    }

    /**
     *
     */
    @Transactional
    @Schedule(second = "0", minute = "0", hour = "9", persistent = false)
    public void atScheduleOneInDay() {
       // LOG.info("atScheduleOneInDay");
    }

}
