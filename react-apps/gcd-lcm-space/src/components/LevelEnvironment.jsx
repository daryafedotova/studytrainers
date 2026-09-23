import { motion } from 'framer-motion';

const ENVIRONMENTS={
  1:{className:'environment-1',label:'Поверхность планеты простых чисел'},
  2:{className:'environment-2',label:'Астероидное поле множителей'},
  3:{className:'environment-3',label:'Орбитальная станция степеней'},
  4:{className:'environment-4',label:'Навигационный сектор общих множителей'},
  5:{className:'environment-5',label:'Планета НОД'},
  6:{className:'environment-6',label:'Штурманский мостик кратных'},
  7:{className:'environment-7',label:'Орбитальная верфь НОК'},
  8:{className:'environment-8',label:'Туманность НОД и НОК'}
};

export function LevelEnvironment({levelId}) {
  const scene=ENVIRONMENTS[levelId]??ENVIRONMENTS[1];
  return <div className={`level-environment ${scene.className}`} aria-hidden="true">
    <div className="scene-stars scene-stars-a"/>
    <div className="scene-stars scene-stars-b"/>
    <motion.div className="scene-orbit orbit-a" animate={{rotate:360}} transition={{duration:55,repeat:Infinity,ease:'linear'}}/>
    <motion.div className="scene-orbit orbit-b" animate={{rotate:-360}} transition={{duration:75,repeat:Infinity,ease:'linear'}}/>
    <motion.div className="scene-planet planet-a" animate={{y:[0,-10,0],rotate:[-4,2,-4]}} transition={{duration:10,repeat:Infinity,ease:'easeInOut'}}/>
    <motion.div className="scene-planet planet-b" animate={{y:[0,8,0],x:[0,-6,0]}} transition={{duration:13,repeat:Infinity,ease:'easeInOut'}}/>
    <div className="scene-horizon"/>
    <div className="scene-cockpit cockpit-left"/>
    <div className="scene-cockpit cockpit-right"/>
    <div className="scene-console-glow"/>
    <div className="scene-asteroids">
      {[0,1,2,3,4,5].map(index=><motion.i key={index} animate={{y:[0,-16,0],x:[0,index%2?8:-8,0],rotate:[0,18,0]}} transition={{duration:8+index,repeat:Infinity,ease:'easeInOut',delay:index*.25}}/> )}
    </div>
    <div className="scene-station">
      <span/><span/><span/>
    </div>
    <div className="scene-route-lines"><i/><i/><i/></div>
    <div className="scene-nebula-cloud cloud-a"/>
    <div className="scene-nebula-cloud cloud-b"/>
    <span className="environment-label">{scene.label}</span>
  </div>;
}
