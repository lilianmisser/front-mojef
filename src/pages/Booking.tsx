import React, { useEffect, useState } from "react";
import BookingCommand from "../components/bookings/Command";
import BookingGames from "../components/bookings/Games";
import BookingContacts from "../components/bookings/Contacts";
import Notes from "../components/bookings/Notes";
import Timeline from "../components/bookings/Timeline";
import { useHistory, useParams } from "react-router-dom";
import { IBooking, ICompany } from "../utils/types";
import { useAxios } from "../hooks/useAxios";
import UIkit from "uikit";

const Booking = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [company, setCompany] = useState<ICompany | null>(null);
  const history = useHistory();
  const instance = useAxios();

  useEffect(() => {
    const fetchData = () => {
      instance
        .get(`/api/booking/${bookingId}`)
        .then((res) => {
          setBooking(res.data);
          instance.get(`/api/company/${res.data.companyId}`).then((res) => {
            setCompany(res.data);
          });
        })
        .catch(() => {
          UIkit.notification({
            message: `Impossible de récupérer ce suivi`,
            status: "danger",
            pos: "top-center",
          });
        });
    };
    fetchData();
  }, [bookingId, instance]);

  const remove = () => {
    UIkit.modal
      .confirm("Etes vous sûr de vouloir supprimer ce suivi ?")
      .then(() => {
        instance
          .delete(`/api/booking/${bookingId}`)
          .then((res) => {
            if (res.data && res.data.deleted) {
              history.goBack();
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            UIkit.notification({
              message: `Impossible de supprimer ce suivi`,
              status: "danger",
              pos: "top-center",
            });
          });
      });
  };

  return (
    <div className="uk-flex uk-flex-column -fullheight">
      <div className="uk-flex uk-flex-between uk-flex-middle">
        <h1 className="uk-heading-bullet">
          {company && company.name}
          {booking?.billPaidOn ? (
            <span className="uk-label uk-label-success uk-margin-left">
              Payé
            </span>
          ) : (
            <span className="uk-label uk-margin-left">En cours</span>
          )}
        </h1>
        <div>
          <span
            className="uk-icon-link uk-margin-small-right -pointer"
            uk-icon="reply"
            onClick={history.goBack}
          />
          <span
            className="uk-icon-link uk-margin-small-right -pointer"
            uk-icon="trash"
            onClick={remove}
          />
        </div>
      </div>
      <ul
        className="uk-tab"
        uk-switcher="animation: uk-animation-fade; toggle: > *"
        uk-tab="true"
      >
        <li>
          <a href="#suivi">Suivi</a>
        </li>
        <li>
          <a href="#informations">Informations</a>
        </li>
        <li>
          <a href="#comptabilite">Comptabilité</a>
        </li>
      </ul>

      <ul className="uk-switcher uk-margin-medium-top -flex-1">
        <li className="-fullheight">
          <div className="uk-flex -fullheight -booking-responsive">
            <div className="-flex-1">
              {booking && (
                <Timeline
                  exchanges={booking.exchanges}
                  bookingId={booking.id!}
                />
              )}
            </div>
            <hr className="uk-divider-vertical -fullheight uk-margin-medium-left uk-margin-medium-right" />
            <div className="-flex-1">
              <div className="uk-flex uk-flex-column -fullheight">
                {company && (
                  <BookingContacts
                    contacts={company.contacts}
                    companyId={company.id!}
                  />
                )}
                {booking && (
                  <Notes notes={booking.notes} bookingId={booking.id!} />
                )}
              </div>
            </div>
          </div>
        </li>
        <li className="-fullheight">
          <div className="uk-flex -fullheight -booking-responsive">
            <div className="-flex-1">
              {booking && <BookingCommand booking={booking} />}
            </div>
            <hr className="uk-divider-vertical -fullheight uk-margin-medium-left uk-margin-medium-right" />
            <div className="-flex-1">
              <BookingGames />
            </div>
          </div>
        </li>
        <li className="-fullheight">comptabilitéComponent</li>
      </ul>
    </div>
  );
};

export default Booking;
