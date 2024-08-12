// necesary cretes
use sails_rs::{
    prelude::*,
    gstd::{
        service,
        msg
    },
    cell::RefMut
};

// import the state
use crate::states::traffic_light_state::TrafficLightState;

// Traffic light service struct to build the service 
// Data is passed to the service as RefMut (command, this change the state)
pub struct TrafficLightService<'a> {
    pub state: RefMut<'a, TrafficLightState>
}

// Trffic light service
#[service]
impl<'a> TrafficLightService<'a> {
    // Service constructor
    pub fn new(state: RefMut<'a, TrafficLightState>) -> Self {
        Self {
            state
        }
    }

    // Remote call "green" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn green(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Green".to_string();

        // Changing state
        self
            .state
            .current_light = current_light.clone();
        self
            .state
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Green
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn yellow(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Yellow".to_string();

        // Changing state
        self
            .state
            .current_light = current_light.clone();
        self
            .state
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Yellow
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn red(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Red".to_string();

        // Changing state
        self
            .state
            .current_light = current_light.clone();
        self
            .state
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Red
    }
}

// struct to use as a response to the user
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum TrafficLightEvent {
    Green,
    Yellow,
    Red
}


