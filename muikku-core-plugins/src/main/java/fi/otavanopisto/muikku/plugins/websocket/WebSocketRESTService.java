package fi.otavanopisto.muikku.plugins.websocket;

import java.util.Date;
import java.util.UUID;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.plugin.PluginRESTService;
import fi.otavanopisto.muikku.plugins.websocket.WebSocketTicket;
import fi.otavanopisto.muikku.rest.RESTPermitUnimplemented;
import fi.otavanopisto.muikku.session.SessionController;

@Stateful
@Path("/websocket")
@RequestScoped
@Produces ("application/json")
public class WebSocketRESTService extends PluginRESTService {

  private static final long serialVersionUID = 8566984492048734313L;

  @Inject
  private SessionController sessionController;
  
  @Inject
  private WebSocketTicketController webSocketTicketController;
  
  @Context
  private HttpServletRequest request;
  
  @POST
  @Path ("/ticket")
  @RESTPermitUnimplemented
  public Response createTicket() {
    UserEntity userEntity = sessionController.getLoggedUserEntity(); 
    Long userEntityId = userEntity != null ? userEntity.getId() : null;
    Date timestamp = new Date();
    String ip = request.getRemoteAddr();
    String ticket = UUID.randomUUID().toString();
    
    webSocketTicketController.createTicket(ticket, userEntityId, ip, timestamp);
    
    return Response.ok(new WebSocketTicketRESTModel(ticket)).build();
  }

  @GET
  @Path ("/ticket/{TICKET}/check")
  @RESTPermitUnimplemented
  public Response check(@PathParam("TICKET") String ticketStr) {
    WebSocketTicket ticket = webSocketTicketController.findTicket(ticketStr);
    if (ticket != null) {
      UserEntity user = sessionController.getLoggedUserEntity(); 
      Long userId = user != null ? user.getId() : null;
      // If we're logged in and the ticket has user information, check that they match
      // Nulls on either side are tolerated since sessions expire, etc. 
      boolean valid = userId != null && ticket.getUser() != null ? userId.equals(ticket.getUser()) : true;  
      if (valid) {
        return Response.noContent().build();
      }
      else {
        return Response.status(Response.Status.NOT_FOUND).build();
      }
    }
    else {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
  }
  
}
